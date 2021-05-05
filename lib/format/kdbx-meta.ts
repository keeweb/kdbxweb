import { KdbxUuid } from './kdbx-uuid';
import * as XmlUtils from '../utils/xml-utils';
import * as XmlNames from '../defs/xml-names';
import { KdbxCustomData, KdbxCustomDataItem, KdbxCustomDataMap } from './kdbx-custom-data';
import { KdbxContext } from './kdbx-context';
import { KdbxError } from '../errors/kdbx-error';
import { Defaults, ErrorCodes } from '../defs/consts';
import { MergeObjectMap } from './kdbx';
import { KdbxBinaries } from './kdbx-binaries';

const MetaConst = {
    Generator: 'KdbxWeb'
};

export interface KdbxMetaEditState {
    mntncHistoryDaysChanged?: Date;
    colorChanged?: Date;
    keyChangeRecChanged?: Date;
    keyChangeForceChanged?: Date;
    historyMaxItemsChanged?: Date;
    historyMaxSizeChanged?: Date;
    lastSelectedGroupChanged?: Date;
    lastTopVisibleGroupChanged?: Date;
    memoryProtectionChanged?: Date;
}

export interface KdbxMemoryProtection {
    title?: boolean;
    userName?: boolean;
    password?: boolean;
    url?: boolean;
    notes?: boolean;
}

export interface KdbxCustomIcon {
    data: ArrayBuffer;
    name?: string;
    lastModified?: Date;
}

export class KdbxMeta {
    generator: string | undefined;
    headerHash: ArrayBuffer | undefined;
    settingsChanged: Date | undefined;
    _name: string | undefined;
    nameChanged: Date | undefined;
    _desc: string | undefined;
    descChanged: Date | undefined;
    _defaultUser: string | undefined;
    defaultUserChanged: Date | undefined;
    _mntncHistoryDays: number | undefined;
    _color: string | undefined;
    keyChanged: Date | undefined;
    _keyChangeRec: number | undefined;
    _keyChangeForce: number | undefined;
    _recycleBinEnabled: boolean | undefined;
    _recycleBinUuid: KdbxUuid | undefined;
    recycleBinChanged: Date | undefined;
    _entryTemplatesGroup: KdbxUuid | undefined;
    entryTemplatesGroupChanged: Date | undefined;
    _historyMaxItems: number | undefined;
    _historyMaxSize: number | undefined;
    _lastSelectedGroup: KdbxUuid | undefined;
    _lastTopVisibleGroup: KdbxUuid | undefined;
    _memoryProtection: KdbxMemoryProtection = {};
    customData: KdbxCustomDataMap = new Map<string, KdbxCustomDataItem>();
    customIcons = new Map<string, KdbxCustomIcon>();
    _editState: KdbxMetaEditState | undefined;

    get editState(): KdbxMetaEditState | undefined {
        return this._editState;
    }
    set editState(value: KdbxMetaEditState | undefined) {
        this._editState = value;
    }

    private getOrCreateEditState(): KdbxMetaEditState {
        if (!this._editState) {
            this._editState = {};
        }
        return this._editState;
    }

    get name(): string | undefined {
        return this._name;
    }
    set name(value: string | undefined) {
        if (value !== this._name) {
            this._name = value;
            this.nameChanged = new Date();
        }
    }

    get desc(): string | undefined {
        return this._desc;
    }
    set desc(value: string | undefined) {
        if (value !== this._desc) {
            this._desc = value;
            this.descChanged = new Date();
        }
    }

    get defaultUser(): string | undefined {
        return this._defaultUser;
    }
    set defaultUser(value: string | undefined) {
        if (value !== this._defaultUser) {
            this._defaultUser = value;
            this.defaultUserChanged = new Date();
        }
    }

    get mntncHistoryDays(): number | undefined {
        return this._mntncHistoryDays;
    }
    set mntncHistoryDays(value: number | undefined) {
        if (value !== this._mntncHistoryDays) {
            this._mntncHistoryDays = value;
            this.getOrCreateEditState().mntncHistoryDaysChanged = new Date();
        }
    }

    get color(): string | undefined {
        return this._color;
    }
    set color(value: string | undefined) {
        if (value !== this._color) {
            this._color = value;
            this.getOrCreateEditState().colorChanged = new Date();
        }
    }

    get keyChangeRec(): number | undefined {
        return this._keyChangeRec;
    }
    set keyChangeRec(value: number | undefined) {
        if (value !== this._keyChangeRec) {
            this._keyChangeRec = value;
            this.getOrCreateEditState().keyChangeRecChanged = new Date();
        }
    }

    get keyChangeForce(): number | undefined {
        return this._keyChangeForce;
    }
    set keyChangeForce(value: number | undefined) {
        if (value !== this._keyChangeForce) {
            this._keyChangeForce = value;
            this.getOrCreateEditState().keyChangeForceChanged = new Date();
        }
    }

    get recycleBinEnabled(): boolean | undefined {
        return this._recycleBinEnabled;
    }
    set recycleBinEnabled(value: boolean | undefined) {
        if (value !== this._recycleBinEnabled) {
            this._recycleBinEnabled = value;
            this.recycleBinChanged = new Date();
        }
    }

    get recycleBinUuid(): KdbxUuid | undefined {
        return this._recycleBinUuid;
    }
    set recycleBinUuid(value: KdbxUuid | undefined) {
        if (value !== this._recycleBinUuid) {
            this._recycleBinUuid = value;
            this.recycleBinChanged = new Date();
        }
    }

    get entryTemplatesGroup(): KdbxUuid | undefined {
        return this._entryTemplatesGroup;
    }
    set entryTemplatesGroup(value: KdbxUuid | undefined) {
        if (value !== this._entryTemplatesGroup) {
            this._entryTemplatesGroup = value;
            this.entryTemplatesGroupChanged = new Date();
        }
    }

    get historyMaxItems(): number | undefined {
        return this._historyMaxItems;
    }
    set historyMaxItems(value: number | undefined) {
        if (value !== this._historyMaxItems) {
            this._historyMaxItems = value;
            this.getOrCreateEditState().historyMaxItemsChanged = new Date();
        }
    }

    get historyMaxSize(): number | undefined {
        return this._historyMaxSize;
    }
    set historyMaxSize(value: number | undefined) {
        if (value !== this._historyMaxSize) {
            this._historyMaxSize = value;
            this.getOrCreateEditState().historyMaxSizeChanged = new Date();
        }
    }

    get lastSelectedGroup(): KdbxUuid | undefined {
        return this._lastSelectedGroup;
    }
    set lastSelectedGroup(value: KdbxUuid | undefined) {
        if (value !== this._lastSelectedGroup) {
            this._lastSelectedGroup = value;
            this.getOrCreateEditState().lastSelectedGroupChanged = new Date();
        }
    }

    get lastTopVisibleGroup(): KdbxUuid | undefined {
        return this._lastTopVisibleGroup;
    }
    set lastTopVisibleGroup(value: KdbxUuid | undefined) {
        if (value !== this._lastTopVisibleGroup) {
            this._lastTopVisibleGroup = value;
            this.getOrCreateEditState().lastTopVisibleGroupChanged = new Date();
        }
    }

    get memoryProtection(): KdbxMemoryProtection {
        return this._memoryProtection;
    }
    set memoryProtection(value: KdbxMemoryProtection) {
        if (value !== this._memoryProtection) {
            this._memoryProtection = value;
            this.getOrCreateEditState().memoryProtectionChanged = new Date();
        }
    }

    private readNode(node: Element, ctx: KdbxContext) {
        switch (node.tagName) {
            case XmlNames.Elem.Generator:
                this.generator = XmlUtils.getText(node);
                break;
            case XmlNames.Elem.HeaderHash:
                this.headerHash = XmlUtils.getBytes(node);
                break;
            case XmlNames.Elem.SettingsChanged:
                this.settingsChanged = XmlUtils.getDate(node);
                break;
            case XmlNames.Elem.DbName:
                this._name = XmlUtils.getText(node);
                break;
            case XmlNames.Elem.DbNameChanged:
                this.nameChanged = XmlUtils.getDate(node);
                break;
            case XmlNames.Elem.DbDesc:
                this._desc = XmlUtils.getText(node);
                break;
            case XmlNames.Elem.DbDescChanged:
                this.descChanged = XmlUtils.getDate(node);
                break;
            case XmlNames.Elem.DbDefaultUser:
                this._defaultUser = XmlUtils.getText(node);
                break;
            case XmlNames.Elem.DbDefaultUserChanged:
                this.defaultUserChanged = XmlUtils.getDate(node);
                break;
            case XmlNames.Elem.DbMntncHistoryDays:
                this._mntncHistoryDays = XmlUtils.getNumber(node);
                break;
            case XmlNames.Elem.DbColor:
                this._color = XmlUtils.getText(node);
                break;
            case XmlNames.Elem.DbKeyChanged:
                this.keyChanged = XmlUtils.getDate(node);
                break;
            case XmlNames.Elem.DbKeyChangeRec:
                this._keyChangeRec = XmlUtils.getNumber(node);
                break;
            case XmlNames.Elem.DbKeyChangeForce:
                this._keyChangeForce = XmlUtils.getNumber(node);
                break;
            case XmlNames.Elem.RecycleBinEnabled:
                this._recycleBinEnabled = XmlUtils.getBoolean(node) ?? undefined;
                break;
            case XmlNames.Elem.RecycleBinUuid:
                this._recycleBinUuid = XmlUtils.getUuid(node);
                break;
            case XmlNames.Elem.RecycleBinChanged:
                this.recycleBinChanged = XmlUtils.getDate(node);
                break;
            case XmlNames.Elem.EntryTemplatesGroup:
                this._entryTemplatesGroup = XmlUtils.getUuid(node);
                break;
            case XmlNames.Elem.EntryTemplatesGroupChanged:
                this.entryTemplatesGroupChanged = XmlUtils.getDate(node);
                break;
            case XmlNames.Elem.HistoryMaxItems:
                this._historyMaxItems = XmlUtils.getNumber(node);
                break;
            case XmlNames.Elem.HistoryMaxSize:
                this._historyMaxSize = XmlUtils.getNumber(node);
                break;
            case XmlNames.Elem.LastSelectedGroup:
                this._lastSelectedGroup = XmlUtils.getUuid(node);
                break;
            case XmlNames.Elem.LastTopVisibleGroup:
                this._lastTopVisibleGroup = XmlUtils.getUuid(node);
                break;
            case XmlNames.Elem.MemoryProt:
                this.readMemoryProtection(node);
                break;
            case XmlNames.Elem.CustomIcons:
                this.readCustomIcons(node);
                break;
            case XmlNames.Elem.Binaries:
                this.readBinaries(node, ctx);
                break;
            case XmlNames.Elem.CustomData:
                this.readCustomData(node);
                break;
        }
    }

    private readMemoryProtection(node: Element) {
        for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
            const childNode = <Element>cn[i];
            switch (childNode.tagName) {
                case XmlNames.Elem.ProtTitle:
                    this.memoryProtection.title = XmlUtils.getBoolean(childNode) ?? undefined;
                    break;
                case XmlNames.Elem.ProtUserName:
                    this.memoryProtection.userName = XmlUtils.getBoolean(childNode) ?? undefined;
                    break;
                case XmlNames.Elem.ProtPassword:
                    this.memoryProtection.password = XmlUtils.getBoolean(childNode) ?? undefined;
                    break;
                case XmlNames.Elem.ProtUrl:
                    this.memoryProtection.url = XmlUtils.getBoolean(childNode) ?? undefined;
                    break;
                case XmlNames.Elem.ProtNotes:
                    this.memoryProtection.notes = XmlUtils.getBoolean(childNode) ?? undefined;
                    break;
            }
        }
    }

    private writeMemoryProtection(parentNode: Element) {
        const node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.MemoryProt);
        XmlUtils.setBoolean(
            XmlUtils.addChildNode(node, XmlNames.Elem.ProtTitle),
            this.memoryProtection.title
        );
        XmlUtils.setBoolean(
            XmlUtils.addChildNode(node, XmlNames.Elem.ProtUserName),
            this.memoryProtection.userName
        );
        XmlUtils.setBoolean(
            XmlUtils.addChildNode(node, XmlNames.Elem.ProtPassword),
            this.memoryProtection.password
        );
        XmlUtils.setBoolean(
            XmlUtils.addChildNode(node, XmlNames.Elem.ProtUrl),
            this.memoryProtection.url
        );
        XmlUtils.setBoolean(
            XmlUtils.addChildNode(node, XmlNames.Elem.ProtNotes),
            this.memoryProtection.notes
        );
    }

    private readCustomIcons(node: Element) {
        for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
            const childNode = <Element>cn[i];
            if (childNode.tagName === XmlNames.Elem.CustomIconItem) {
                this.readCustomIcon(childNode);
            }
        }
    }

    private readCustomIcon(node: Element) {
        let uuid, data, name, lastModified;
        for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
            const childNode = <Element>cn[i];
            switch (childNode.tagName) {
                case XmlNames.Elem.CustomIconItemID:
                    uuid = XmlUtils.getUuid(childNode);
                    break;
                case XmlNames.Elem.CustomIconItemData:
                    data = XmlUtils.getBytes(childNode);
                    break;
                case XmlNames.Elem.CustomIconItemName:
                    name = XmlUtils.getText(childNode) ?? undefined;
                    break;
                case XmlNames.Elem.LastModTime:
                    lastModified = XmlUtils.getDate(childNode);
                    break;
            }
        }
        if (uuid && data) {
            this.customIcons.set(uuid.id, { data, name, lastModified });
        }
    }

    private writeCustomIcons(parentNode: Element, ctx: KdbxContext) {
        const node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.CustomIcons);
        for (const [uuid, { data, name, lastModified }] of this.customIcons) {
            if (data) {
                const itemNode = XmlUtils.addChildNode(node, XmlNames.Elem.CustomIconItem);
                XmlUtils.setUuid(
                    XmlUtils.addChildNode(itemNode, XmlNames.Elem.CustomIconItemID),
                    uuid
                );
                XmlUtils.setBytes(
                    XmlUtils.addChildNode(itemNode, XmlNames.Elem.CustomIconItemData),
                    data
                );
                if (ctx.kdbx.versionIsAtLeast(4, 1)) {
                    if (name) {
                        XmlUtils.setText(
                            XmlUtils.addChildNode(itemNode, XmlNames.Elem.CustomIconItemName),
                            name
                        );
                    }
                    if (lastModified) {
                        XmlUtils.setDate(
                            XmlUtils.addChildNode(itemNode, XmlNames.Elem.LastModTime),
                            lastModified
                        );
                    }
                }
            }
        }
    }

    private readBinaries(node: Element, ctx: KdbxContext) {
        for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
            const childNode = <Element>cn[i];
            if (childNode.tagName === XmlNames.Elem.Binary) {
                this.readBinary(childNode, ctx);
            }
        }
    }

    private readBinary(node: Element, ctx: KdbxContext) {
        const id = node.getAttribute(XmlNames.Attr.Id);
        const binary = XmlUtils.getProtectedBinary(node);
        if (id && binary) {
            if (KdbxBinaries.isKdbxBinaryRef(binary)) {
                throw new KdbxError(ErrorCodes.FileCorrupt, 'binary ref in meta');
            }
            ctx.kdbx.binaries.addWithId(id, binary);
        }
    }

    private writeBinaries(parentNode: Element, ctx: KdbxContext) {
        const node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Binaries);
        const binaries = ctx.kdbx.binaries.getAll();
        for (const binary of binaries) {
            const itemNode = XmlUtils.addChildNode(node, XmlNames.Elem.Binary);
            itemNode.setAttribute(XmlNames.Attr.Id, binary.ref);
            XmlUtils.setProtectedBinary(itemNode, binary.value);
        }
    }

    private readCustomData(node: Element) {
        this.customData = KdbxCustomData.read(node);
    }

    private writeCustomData(parentNode: Element, ctx: KdbxContext) {
        KdbxCustomData.write(parentNode, ctx, this.customData);
    }

    write(parentNode: Node, ctx: KdbxContext): void {
        this.generator = MetaConst.Generator;
        const node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Meta);
        XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Generator), MetaConst.Generator);
        if (ctx.kdbx.versionMajor < 4) {
            XmlUtils.setBytes(
                XmlUtils.addChildNode(node, XmlNames.Elem.HeaderHash),
                this.headerHash
            );
        } else if (this.settingsChanged) {
            ctx.setXmlDate(
                XmlUtils.addChildNode(node, XmlNames.Elem.SettingsChanged),
                this.settingsChanged
            );
        }
        XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.DbName), this.name);
        ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.DbNameChanged), this.nameChanged);
        XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.DbDesc), this.desc);
        ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.DbDescChanged), this.descChanged);
        XmlUtils.setText(
            XmlUtils.addChildNode(node, XmlNames.Elem.DbDefaultUser),
            this.defaultUser
        );
        ctx.setXmlDate(
            XmlUtils.addChildNode(node, XmlNames.Elem.DbDefaultUserChanged),
            this.defaultUserChanged
        );
        XmlUtils.setNumber(
            XmlUtils.addChildNode(node, XmlNames.Elem.DbMntncHistoryDays),
            this.mntncHistoryDays
        );
        XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.DbColor), this.color);
        ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.DbKeyChanged), this.keyChanged);
        XmlUtils.setNumber(
            XmlUtils.addChildNode(node, XmlNames.Elem.DbKeyChangeRec),
            this.keyChangeRec
        );
        XmlUtils.setNumber(
            XmlUtils.addChildNode(node, XmlNames.Elem.DbKeyChangeForce),
            this.keyChangeForce
        );
        XmlUtils.setBoolean(
            XmlUtils.addChildNode(node, XmlNames.Elem.RecycleBinEnabled),
            this.recycleBinEnabled
        );
        XmlUtils.setUuid(
            XmlUtils.addChildNode(node, XmlNames.Elem.RecycleBinUuid),
            this.recycleBinUuid
        );
        ctx.setXmlDate(
            XmlUtils.addChildNode(node, XmlNames.Elem.RecycleBinChanged),
            this.recycleBinChanged
        );
        XmlUtils.setUuid(
            XmlUtils.addChildNode(node, XmlNames.Elem.EntryTemplatesGroup),
            this.entryTemplatesGroup
        );
        ctx.setXmlDate(
            XmlUtils.addChildNode(node, XmlNames.Elem.EntryTemplatesGroupChanged),
            this.entryTemplatesGroupChanged
        );
        XmlUtils.setNumber(
            XmlUtils.addChildNode(node, XmlNames.Elem.HistoryMaxItems),
            this.historyMaxItems
        );
        XmlUtils.setNumber(
            XmlUtils.addChildNode(node, XmlNames.Elem.HistoryMaxSize),
            this.historyMaxSize
        );
        XmlUtils.setUuid(
            XmlUtils.addChildNode(node, XmlNames.Elem.LastSelectedGroup),
            this.lastSelectedGroup
        );
        XmlUtils.setUuid(
            XmlUtils.addChildNode(node, XmlNames.Elem.LastTopVisibleGroup),
            this.lastTopVisibleGroup
        );
        this.writeMemoryProtection(node);
        this.writeCustomIcons(node, ctx);
        if (ctx.exportXml || ctx.kdbx.versionMajor < 4) {
            this.writeBinaries(node, ctx);
        }
        this.writeCustomData(node, ctx);
    }

    merge(remote: KdbxMeta, objectMap: MergeObjectMap): void {
        if (this.needUpdate(remote.nameChanged, this.nameChanged)) {
            this._name = remote.name;
            this.nameChanged = remote.nameChanged;
        }
        if (this.needUpdate(remote.descChanged, this.descChanged)) {
            this._desc = remote.desc;
            this.descChanged = remote.descChanged;
        }
        if (this.needUpdate(remote.defaultUserChanged, this.defaultUserChanged)) {
            this._defaultUser = remote.defaultUser;
            this.defaultUserChanged = remote.defaultUserChanged;
        }
        if (this.needUpdate(remote.keyChanged, this.keyChanged)) {
            this.keyChanged = remote.keyChanged;
        }
        if (this.needUpdate(remote.settingsChanged, this.settingsChanged)) {
            this.settingsChanged = remote.settingsChanged;
        }
        if (this.needUpdate(remote.recycleBinChanged, this.recycleBinChanged)) {
            this._recycleBinEnabled = remote.recycleBinEnabled;
            this._recycleBinUuid = remote.recycleBinUuid;
            this.recycleBinChanged = remote.recycleBinChanged;
        }
        if (this.needUpdate(remote.entryTemplatesGroupChanged, this.entryTemplatesGroupChanged)) {
            this._entryTemplatesGroup = remote.entryTemplatesGroup;
            this.entryTemplatesGroupChanged = remote.entryTemplatesGroupChanged;
        }
        this.mergeMapWithDates(this.customData, remote.customData, objectMap);
        this.mergeMapWithDates(this.customIcons, remote.customIcons, objectMap);
        if (!this._editState?.historyMaxItemsChanged) {
            this.historyMaxItems = remote.historyMaxItems;
        }
        if (!this._editState?.historyMaxSizeChanged) {
            this.historyMaxSize = remote.historyMaxSize;
        }
        if (!this._editState?.keyChangeRecChanged) {
            this.keyChangeRec = remote.keyChangeRec;
        }
        if (!this._editState?.keyChangeForceChanged) {
            this.keyChangeForce = remote.keyChangeForce;
        }
        if (!this._editState?.mntncHistoryDaysChanged) {
            this.mntncHistoryDays = remote.mntncHistoryDays;
        }
        if (!this._editState?.colorChanged) {
            this.color = remote.color;
        }
    }

    private mergeMapWithDates<T extends { lastModified?: Date }>(
        local: Map<string, T>,
        remote: Map<string, T>,
        objectMap: MergeObjectMap
    ) {
        for (const [key, remoteItem] of remote) {
            const existingItem = local.get(key);
            if (existingItem) {
                if (
                    existingItem.lastModified &&
                    remoteItem.lastModified &&
                    remoteItem.lastModified > existingItem.lastModified
                ) {
                    local.set(key, remoteItem);
                }
            } else if (!objectMap.deleted.has(key)) {
                local.set(key, remoteItem);
            }
        }
    }

    needUpdate(remoteDate: Date | undefined, localDate: Date | undefined): boolean {
        if (!remoteDate) {
            return false;
        }
        if (!localDate) {
            return true;
        }
        return remoteDate > localDate;
    }

    /**
     * Creates new meta
     * @returns {KdbxMeta}
     */
    static create(): KdbxMeta {
        const now = new Date();
        const meta = new KdbxMeta();
        meta.generator = MetaConst.Generator;
        meta.settingsChanged = now;
        meta.mntncHistoryDays = Defaults.MntncHistoryDays;
        meta.recycleBinEnabled = true;
        meta.historyMaxItems = Defaults.HistoryMaxItems;
        meta.historyMaxSize = Defaults.HistoryMaxSize;
        meta.nameChanged = now;
        meta.descChanged = now;
        meta.defaultUserChanged = now;
        meta.recycleBinChanged = now;
        meta.keyChangeRec = -1;
        meta.keyChangeForce = -1;
        meta.entryTemplatesGroup = new KdbxUuid();
        meta.entryTemplatesGroupChanged = now;
        meta.memoryProtection = {
            title: false,
            userName: false,
            password: true,
            url: false,
            notes: false
        };
        return meta;
    }

    static read(xmlNode: Node, ctx: KdbxContext): KdbxMeta {
        const meta = new KdbxMeta();
        for (let i = 0, cn = xmlNode.childNodes, len = cn.length; i < len; i++) {
            const childNode = <Element>cn[i];
            if (childNode.tagName) {
                meta.readNode(childNode, ctx);
            }
        }
        return meta;
    }
}
