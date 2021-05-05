import * as XmlNames from '../defs/xml-names';
import * as XmlUtils from './../utils/xml-utils';
import { KdbxBinaries, KdbxBinary, KdbxBinaryWithHash } from './kdbx-binaries';
import { KdbxDeletedObject } from './kdbx-deleted-object';
import { KdbxGroup } from './kdbx-group';
import { KdbxMeta, KdbxMetaEditState } from './kdbx-meta';
import { KdbxCredentials } from './kdbx-credentials';
import { KdbxHeader } from './kdbx-header';
import { KdbxError } from '../errors/kdbx-error';
import { Defaults, ErrorCodes, Icons } from '../defs/consts';
import { KdbxFormat } from './kdbx-format';
import { KdbxEntry, KdbxEntryEditState } from './kdbx-entry';
import { KdbxUuid } from './kdbx-uuid';
import { KdbxContext } from './kdbx-context';

export interface KdbxEditState {
    entries?: { [name: string]: KdbxEntryEditState };
    meta?: KdbxMetaEditState;
}

export interface MergeObjectMap {
    entries: Map<string, KdbxEntry>;
    groups: Map<string, KdbxGroup>;
    remoteEntries: Map<string, KdbxEntry>;
    remoteGroups: Map<string, KdbxGroup>;
    deleted: Map<string, Date>;
}

export class Kdbx {
    header = new KdbxHeader();
    credentials = new KdbxCredentials(null);
    meta = new KdbxMeta();
    xml: Document | undefined;
    binaries = new KdbxBinaries();
    groups: KdbxGroup[] = [];
    deletedObjects: KdbxDeletedObject[] = [];

    get versionMajor(): number {
        return this.header.versionMajor;
    }

    get versionMinor(): number {
        return this.header.versionMinor;
    }

    /**
     * Creates a new database
     */
    static create(credentials: KdbxCredentials, name: string): Kdbx {
        if (!(credentials instanceof KdbxCredentials)) {
            throw new KdbxError(ErrorCodes.InvalidArg, 'credentials');
        }
        const kdbx = new Kdbx();
        kdbx.credentials = credentials;
        kdbx.header = KdbxHeader.create();
        kdbx.meta = KdbxMeta.create();
        kdbx.meta._name = name;
        kdbx.createDefaultGroup();
        kdbx.createRecycleBin();
        kdbx.meta._lastSelectedGroup = kdbx.getDefaultGroup().uuid;
        kdbx.meta._lastTopVisibleGroup = kdbx.getDefaultGroup().uuid;
        return kdbx;
    }

    /**
     * Load a kdbx file
     * If there was an error loading file, throws an exception
     */
    static load(
        data: ArrayBuffer,
        credentials: KdbxCredentials,
        options?: { preserveXml?: boolean }
    ): Promise<Kdbx> {
        if (!(data instanceof ArrayBuffer)) {
            return Promise.reject(new KdbxError(ErrorCodes.InvalidArg, 'data'));
        }
        if (!(credentials instanceof KdbxCredentials)) {
            return Promise.reject(new KdbxError(ErrorCodes.InvalidArg, 'credentials'));
        }
        const kdbx = new Kdbx();
        kdbx.credentials = credentials;
        const format = new KdbxFormat(kdbx);
        format.preserveXml = options?.preserveXml || false;
        return format.load(data);
    }

    /**
     * Import database from an xml file
     * If there was an error loading file, throws an exception
     */
    static loadXml(data: string, credentials: KdbxCredentials): Promise<Kdbx> {
        if (typeof data !== 'string') {
            return Promise.reject(new KdbxError(ErrorCodes.InvalidArg, 'data'));
        }
        if (!(credentials instanceof KdbxCredentials)) {
            return Promise.reject(new KdbxError(ErrorCodes.InvalidArg, 'credentials'));
        }
        const kdbx = new Kdbx();
        kdbx.credentials = credentials;
        const format = new KdbxFormat(kdbx);
        return format.loadXml(data);
    }

    /**
     * Save the db to ArrayBuffer
     */
    save(): Promise<ArrayBuffer> {
        const format = new KdbxFormat(this);
        return format.save();
    }

    /**
     * Save the db as XML string
     */
    saveXml(prettyPrint = false): Promise<string> {
        const format = new KdbxFormat(this);
        return format.saveXml(prettyPrint);
    }

    /**
     * Creates a default group, if it's not yet created
     */
    createDefaultGroup(): void {
        if (this.groups.length) {
            return;
        }
        const defaultGroup = KdbxGroup.create(this.meta.name || '');
        defaultGroup.icon = Icons.FolderOpen;
        defaultGroup.expanded = true;
        this.groups.push(defaultGroup);
    }

    /**
     * Creates a recycle bin group, if it's not yet created
     */
    createRecycleBin(): void {
        this.meta.recycleBinEnabled = true;
        if (this.meta.recycleBinUuid && this.getGroup(this.meta.recycleBinUuid)) {
            return;
        }
        const defGrp = this.getDefaultGroup();
        const recycleBin = KdbxGroup.create(Defaults.RecycleBinName, defGrp);
        recycleBin.icon = Icons.TrashBin;
        recycleBin.enableAutoType = false;
        recycleBin.enableSearching = false;
        this.meta.recycleBinUuid = recycleBin.uuid;
        defGrp.groups.push(recycleBin);
    }

    /**
     * Adds a new group to an existing group
     */
    createGroup(group: KdbxGroup, name: string): KdbxGroup {
        const subGroup = KdbxGroup.create(name, group);
        group.groups.push(subGroup);
        return subGroup;
    }

    /**
     * Adds a new entry to a group
     */
    createEntry(group: KdbxGroup): KdbxEntry {
        const entry = KdbxEntry.create(this.meta, group);
        group.entries.push(entry);
        return entry;
    }

    /**
     * Gets the default group
     */
    getDefaultGroup(): KdbxGroup {
        if (!this.groups[0]) {
            throw new KdbxError(ErrorCodes.InvalidState, 'empty default group');
        }
        return this.groups[0];
    }

    /**
     * Get a group by uuid, returns undefined if it's not found
     */
    getGroup(uuid: KdbxUuid | string, parentGroup?: KdbxGroup): KdbxGroup | undefined {
        const groups = parentGroup ? parentGroup.groups : this.groups;
        for (const group of groups) {
            if (group.uuid.equals(uuid)) {
                return group;
            }
            const res = this.getGroup(uuid, group);
            if (res) {
                return res;
            }
        }
    }

    /**
     * Move an object from one group to another
     * @param object - object to be moved
     * @param toGroup - target parent group
     * @param atIndex - index in target group (by default, insert to the end of the group)
     */
    move<T extends KdbxEntry | KdbxGroup>(
        object: T,
        toGroup: KdbxGroup | undefined | null,
        atIndex?: number
    ): void {
        const containerProp = object instanceof KdbxGroup ? 'groups' : 'entries';
        const fromContainer = <T[]>object.parentGroup?.[containerProp];
        const ix = fromContainer?.indexOf(object);
        if (typeof ix !== 'number' || ix < 0) {
            return;
        }
        fromContainer.splice(ix, 1);
        if (toGroup) {
            const toContainer = <T[]>toGroup[containerProp];
            if (typeof atIndex === 'number' && atIndex >= 0) {
                toContainer.splice(atIndex, 0, object);
            } else {
                toContainer.push(object);
            }
        } else {
            const now = new Date();
            if (object instanceof KdbxGroup) {
                for (const item of object.allGroupsAndEntries()) {
                    const uuid = item.uuid;
                    this.addDeletedObject(uuid, now);
                }
            } else {
                if (object.uuid) {
                    this.addDeletedObject(object.uuid, now);
                }
            }
        }
        object.previousParentGroup = object.parentGroup?.uuid;
        object.parentGroup = toGroup ?? undefined;
        object.times.locationChanged = new Date();
    }

    /**
     * Adds a so-called deleted object, this is used to keep track of objects during merging
     * @param uuid - object uuid
     * @param dt - deletion date
     */
    addDeletedObject(uuid: KdbxUuid, dt: Date): void {
        const deletedObject = new KdbxDeletedObject();
        deletedObject.uuid = uuid;
        deletedObject.deletionTime = dt;
        this.deletedObjects.push(deletedObject);
    }

    /**
     * Delete an entry or a group
     * Depending on settings, removes either to trash, or completely
     */
    remove<T extends KdbxEntry | KdbxGroup>(object: T): void {
        let toGroup = undefined;
        if (this.meta.recycleBinEnabled && this.meta.recycleBinUuid) {
            this.createRecycleBin();
            toGroup = this.getGroup(this.meta.recycleBinUuid);
        }
        this.move(object, toGroup);
    }

    /**
     * Creates a binary in the db and returns an object that can be put to entry.binaries
     */
    createBinary(value: KdbxBinary): Promise<KdbxBinaryWithHash> {
        return this.binaries.add(value);
    }

    /**
     * Import an entry from another file
     * It's up to caller to decide what should happen to the original entry in the source file
     * Returns the new entry
     * @param entry - entry to be imported
     * @param group - target parent group
     * @param file - the source file containing the group
     */
    importEntry(entry: KdbxEntry, group: KdbxGroup, file: Kdbx): KdbxEntry {
        const newEntry = new KdbxEntry();
        const uuid = KdbxUuid.random();

        newEntry.copyFrom(entry);
        newEntry.uuid = uuid;

        for (const historyEntry of entry.history) {
            const newHistoryEntry = new KdbxEntry();
            newHistoryEntry.copyFrom(historyEntry);
            newHistoryEntry.uuid = uuid;
            newEntry.history.push(newHistoryEntry);
        }

        const binaries = new Map<string, KdbxBinaryWithHash>();
        const customIcons = new Set<string>();
        for (const e of newEntry.history.concat(newEntry)) {
            if (e.customIcon) {
                customIcons.add(e.customIcon.id);
            }
            for (const binary of e.binaries.values()) {
                if (KdbxBinaries.isKdbxBinaryWithHash(binary)) {
                    binaries.set(binary.hash, binary);
                }
            }
        }

        for (const binary of binaries.values()) {
            const fileBinary = file.binaries.getValueByHash(binary.hash);
            if (fileBinary && !this.binaries.getValueByHash(binary.hash)) {
                this.binaries.addWithHash(binary);
            }
        }

        for (const customIconId of customIcons) {
            const customIcon = file.meta.customIcons.get(customIconId);
            if (customIcon) {
                this.meta.customIcons.set(customIconId, customIcon);
            }
        }

        group.entries.push(newEntry);

        newEntry.parentGroup = group;
        newEntry.times.update();

        return newEntry;
    }

    /**
     * Perform database cleanup
     * @param settings.historyRules - remove extra history, it it doesn't match defined rules, e.g. records number
     * @param settings.customIcons - remove unused custom icons
     * @param settings.binaries - remove unused binaries
     */
    cleanup(settings?: {
        historyRules?: boolean;
        customIcons?: boolean;
        binaries?: boolean;
    }): void {
        const now = new Date();
        const historyMaxItems =
            settings?.historyRules &&
            typeof this.meta.historyMaxItems === 'number' &&
            this.meta.historyMaxItems >= 0
                ? this.meta.historyMaxItems
                : Infinity;

        const usedCustomIcons = new Set<string>();
        const usedBinaries = new Set<string>();

        const processEntry = (entry: KdbxEntry) => {
            if (entry.customIcon) {
                usedCustomIcons.add(entry.customIcon.id);
            }
            for (const binary of entry.binaries.values()) {
                if (KdbxBinaries.isKdbxBinaryWithHash(binary)) {
                    usedBinaries.add(binary.hash);
                }
            }
        };
        for (const item of this.getDefaultGroup().allGroupsAndEntries()) {
            if (item instanceof KdbxEntry) {
                if (item.history.length > historyMaxItems) {
                    item.removeHistory(0, item.history.length - historyMaxItems);
                }
                processEntry(item);
                if (item.history) {
                    for (const historyEntry of item.history) {
                        processEntry(historyEntry);
                    }
                }
            } else {
                if (item.customIcon) {
                    usedCustomIcons.add(item.customIcon.id);
                }
            }
        }

        if (settings?.customIcons) {
            for (const customIcon of this.meta.customIcons.keys()) {
                if (!usedCustomIcons.has(customIcon)) {
                    const uuid = new KdbxUuid(customIcon);
                    this.addDeletedObject(uuid, now);
                    this.meta.customIcons.delete(customIcon);
                }
            }
        }
        if (settings?.binaries) {
            for (const binary of this.binaries.getAllWithHashes()) {
                if (!usedBinaries.has(binary.hash)) {
                    this.binaries.deleteWithHash(binary.hash);
                }
            }
        }
    }

    /**
     * Merge the db with another db
     * Some parts of the remote DB are copied by reference, so it should NOT be modified after merge
     * Suggested use case:
     * - open the local db
     * - get a remote db somehow and open in
     * - merge the remote db into the local db: local.merge(remote)
     * - close the remote db
     * @param remote - database to merge in
     */
    merge(remote: Kdbx): void {
        const root = this.getDefaultGroup();
        const remoteRoot = remote.getDefaultGroup();

        if (!root || !remoteRoot) {
            throw new KdbxError(ErrorCodes.MergeError, 'no default group');
        }
        if (!root.uuid.equals(remoteRoot.uuid)) {
            throw new KdbxError(ErrorCodes.MergeError, 'default group is different');
        }

        const objectMap = this.getObjectMap();
        for (const rem of remote.deletedObjects) {
            if (rem.uuid && rem.deletionTime && !objectMap.deleted.has(rem.uuid.id)) {
                this.deletedObjects.push(rem);
                objectMap.deleted.set(rem.uuid.id, rem.deletionTime);
            }
        }
        for (const remoteBinary of remote.binaries.getAllWithHashes()) {
            if (!this.binaries.getValueByHash(remoteBinary.hash)) {
                this.binaries.addWithHash(remoteBinary);
            }
        }

        const remoteObjectMap = remote.getObjectMap();
        objectMap.remoteEntries = remoteObjectMap.entries;
        objectMap.remoteGroups = remoteObjectMap.groups;

        this.meta.merge(remote.meta, objectMap);
        root.merge(objectMap);

        this.cleanup({ historyRules: true, customIcons: true, binaries: true });
    }

    /**
     * Gets editing state tombstones (for successful merge)
     * The replica must save this state with the db, assign in on opening the db,
     * and call removeLocalEditState on successful upstream push.
     * This state is JSON serializable.
     */
    getLocalEditState(): KdbxEditState {
        const editingState: KdbxEditState = {
            entries: {}
        };
        for (const entry of this.getDefaultGroup().allEntries()) {
            if (entry._editState && entry.uuid && editingState.entries) {
                editingState.entries[entry.uuid.id] = entry._editState;
            }
        }
        if (this.meta._editState) {
            editingState.meta = this.meta._editState;
        }
        return editingState;
    }

    /**
     * Sets editing state tombstones returned previously by getLocalEditState
     * The replica must call this method on opening the db to the state returned previously on getLocalEditState.
     * @param editingState - result of getLocalEditState invoked before on saving the db
     */
    setLocalEditState(editingState: KdbxEditState): void {
        for (const entry of this.getDefaultGroup().allEntries()) {
            if (editingState.entries?.[entry.uuid.id]) {
                entry._editState = editingState.entries[entry.uuid.id];
            }
        }
        if (editingState.meta) {
            this.meta._editState = editingState.meta;
        }
    }

    /**
     * Removes editing state tombstones
     * Immediately after successful upstream push the replica must:
     * - call this method
     * - discard any previous state obtained by getLocalEditState call before
     */
    removeLocalEditState(): void {
        for (const entry of this.getDefaultGroup().allEntries()) {
            entry._editState = undefined;
        }
        this.meta._editState = undefined;
    }

    /**
     * Upgrade the file to latest version
     */
    upgrade(): void {
        this.setVersion(KdbxHeader.MaxFileVersion);
    }

    /**
     * Set the file version to a specified number
     */
    setVersion(version: 3 | 4): void {
        this.meta.headerHash = undefined;
        this.meta.settingsChanged = new Date();
        this.header.setVersion(version);
    }

    /**
     * Set file key derivation function
     * @param kdf - KDF id, from KdfId
     */
    setKdf(kdf: string): void {
        this.meta.headerHash = undefined;
        this.meta.settingsChanged = new Date();
        this.header.setKdf(kdf);
    }

    private getObjectMap(): MergeObjectMap {
        const objectMap: MergeObjectMap = {
            entries: new Map<string, KdbxEntry>(),
            groups: new Map<string, KdbxGroup>(),
            remoteEntries: new Map<string, KdbxEntry>(),
            remoteGroups: new Map<string, KdbxGroup>(),
            deleted: new Map<string, Date>()
        };
        for (const item of this.getDefaultGroup().allGroupsAndEntries()) {
            if (objectMap.entries.has(item.uuid.id)) {
                throw new KdbxError(ErrorCodes.MergeError, `duplicate: ${item.uuid}`);
            }
            if (item instanceof KdbxEntry) {
                objectMap.entries.set(item.uuid.id, item);
            } else {
                objectMap.groups.set(item.uuid.id, item);
            }
        }
        for (const deletedObject of this.deletedObjects) {
            if (deletedObject.uuid && deletedObject.deletionTime) {
                objectMap.deleted.set(deletedObject.uuid.id, deletedObject.deletionTime);
            }
        }
        return objectMap;
    }

    loadFromXml(ctx: KdbxContext): Promise<Kdbx> {
        if (!this.xml) {
            throw new KdbxError(ErrorCodes.InvalidState, 'xml is not set');
        }
        const doc = this.xml.documentElement;
        if (doc.tagName !== XmlNames.Elem.DocNode) {
            throw new KdbxError(ErrorCodes.FileCorrupt, 'bad xml root');
        }
        this.parseMeta(ctx);
        return this.binaries.computeHashes().then(() => {
            this.parseRoot(ctx);
            return this;
        });
    }

    private parseMeta(ctx: KdbxContext): void {
        if (!this.xml) {
            throw new KdbxError(ErrorCodes.InvalidState, 'xml is not set');
        }
        const node = XmlUtils.getChildNode(
            this.xml.documentElement,
            XmlNames.Elem.Meta,
            'no meta node'
        );
        this.meta = KdbxMeta.read(node, ctx);
    }

    private parseRoot(ctx: KdbxContext): void {
        if (!this.xml) {
            throw new KdbxError(ErrorCodes.InvalidState, 'xml is not set');
        }
        this.groups = [];
        this.deletedObjects = [];
        const node = XmlUtils.getChildNode(
            this.xml.documentElement,
            XmlNames.Elem.Root,
            'no root node'
        );
        for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
            const childNode = <Element>cn[i];
            switch (childNode.tagName) {
                case XmlNames.Elem.Group:
                    this.readGroup(childNode, ctx);
                    break;
                case XmlNames.Elem.DeletedObjects:
                    this.readDeletedObjects(childNode);
                    break;
            }
        }
    }

    private readDeletedObjects(node: Node): void {
        for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
            const childNode = <Element>cn[i];
            switch (childNode.tagName) {
                case XmlNames.Elem.DeletedObject:
                    this.deletedObjects.push(KdbxDeletedObject.read(childNode));
                    break;
            }
        }
    }

    private readGroup(node: Node, ctx: KdbxContext): void {
        this.groups.push(KdbxGroup.read(node, ctx));
    }

    buildXml(ctx: KdbxContext): void {
        const xml = XmlUtils.create(XmlNames.Elem.DocNode);
        this.meta.write(xml.documentElement, ctx);
        const rootNode = XmlUtils.addChildNode(xml.documentElement, XmlNames.Elem.Root);
        for (const g of this.groups) {
            g.write(rootNode, ctx);
        }
        const delObjNode = XmlUtils.addChildNode(rootNode, XmlNames.Elem.DeletedObjects);
        for (const d of this.deletedObjects) {
            d.write(delObjNode, ctx);
        }
        this.xml = xml;
    }

    versionIsAtLeast(major: number, minor: number): boolean {
        return (
            this.versionMajor > major || (this.versionMajor === major && this.versionMinor >= minor)
        );
    }
}
