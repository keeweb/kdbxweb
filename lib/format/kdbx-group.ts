import * as XmlNames from './../defs/xml-names';
import * as XmlUtils from './../utils/xml-utils';
import { KdbxTimes } from './kdbx-times';
import { KdbxUuid } from './kdbx-uuid';
import { KdbxEntry } from './kdbx-entry';
import { KdbxCustomData, KdbxCustomDataMap } from './kdbx-custom-data';
import { Icons } from '../defs/consts';
import { KdbxContext } from './kdbx-context';
import { MergeObjectMap } from './kdbx';

export class KdbxGroup {
    uuid = new KdbxUuid();
    name: string | undefined;
    notes: string | undefined;
    icon: number | undefined;
    customIcon: KdbxUuid | undefined;
    tags: string[] = [];
    times = new KdbxTimes();
    expanded: boolean | undefined;
    defaultAutoTypeSeq: string | undefined;
    enableAutoType: boolean | null | undefined;
    enableSearching: boolean | null | undefined;
    lastTopVisibleEntry: KdbxUuid | undefined;
    groups: KdbxGroup[] = [];
    entries: KdbxEntry[] = [];
    parentGroup: KdbxGroup | undefined;
    previousParentGroup: KdbxUuid | undefined;
    customData: KdbxCustomDataMap | undefined;

    get lastModTime(): number {
        return this.times.lastModTime?.getTime() ?? 0;
    }

    get locationChanged(): number {
        return this.times.locationChanged?.getTime() ?? 0;
    }

    private readNode(node: Element, ctx: KdbxContext) {
        switch (node.tagName) {
            case XmlNames.Elem.Uuid:
                this.uuid = XmlUtils.getUuid(node) ?? new KdbxUuid();
                break;
            case XmlNames.Elem.Name:
                this.name = XmlUtils.getText(node);
                break;
            case XmlNames.Elem.Notes:
                this.notes = XmlUtils.getText(node);
                break;
            case XmlNames.Elem.Icon:
                this.icon = XmlUtils.getNumber(node);
                break;
            case XmlNames.Elem.CustomIconID:
                this.customIcon = XmlUtils.getUuid(node);
                break;
            case XmlNames.Elem.Tags:
                this.tags = XmlUtils.getTags(node);
                break;
            case XmlNames.Elem.Times:
                this.times = KdbxTimes.read(node);
                break;
            case XmlNames.Elem.IsExpanded:
                this.expanded = XmlUtils.getBoolean(node) ?? undefined;
                break;
            case XmlNames.Elem.GroupDefaultAutoTypeSeq:
                this.defaultAutoTypeSeq = XmlUtils.getText(node);
                break;
            case XmlNames.Elem.EnableAutoType:
                this.enableAutoType = XmlUtils.getBoolean(node);
                break;
            case XmlNames.Elem.EnableSearching:
                this.enableSearching = XmlUtils.getBoolean(node);
                break;
            case XmlNames.Elem.LastTopVisibleEntry:
                this.lastTopVisibleEntry = XmlUtils.getUuid(node);
                break;
            case XmlNames.Elem.Group:
                this.groups.push(KdbxGroup.read(node, ctx, this));
                break;
            case XmlNames.Elem.Entry:
                this.entries.push(KdbxEntry.read(node, ctx, this));
                break;
            case XmlNames.Elem.CustomData:
                this.customData = KdbxCustomData.read(node);
                break;
            case XmlNames.Elem.PreviousParentGroup:
                this.previousParentGroup = XmlUtils.getUuid(node);
                break;
        }
    }

    write(parentNode: Node, ctx: KdbxContext): void {
        const node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Group);
        XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.Uuid), this.uuid);
        XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Name), this.name);
        XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Notes), this.notes);
        XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.Icon), this.icon);
        if (this.tags.length && ctx.kdbx.versionIsAtLeast(4, 1)) {
            XmlUtils.setTags(XmlUtils.addChildNode(node, XmlNames.Elem.Tags), this.tags);
        }
        if (this.customIcon) {
            XmlUtils.setUuid(
                XmlUtils.addChildNode(node, XmlNames.Elem.CustomIconID),
                this.customIcon
            );
        }
        if (this.previousParentGroup !== undefined && ctx.kdbx.versionIsAtLeast(4, 1)) {
            XmlUtils.setUuid(
                XmlUtils.addChildNode(node, XmlNames.Elem.PreviousParentGroup),
                this.previousParentGroup
            );
        }
        if (this.customData) {
            KdbxCustomData.write(node, ctx, this.customData);
        }
        this.times.write(node, ctx);
        XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.IsExpanded), this.expanded);
        XmlUtils.setText(
            XmlUtils.addChildNode(node, XmlNames.Elem.GroupDefaultAutoTypeSeq),
            this.defaultAutoTypeSeq
        );
        XmlUtils.setBoolean(
            XmlUtils.addChildNode(node, XmlNames.Elem.EnableAutoType),
            this.enableAutoType
        );
        XmlUtils.setBoolean(
            XmlUtils.addChildNode(node, XmlNames.Elem.EnableSearching),
            this.enableSearching
        );
        XmlUtils.setUuid(
            XmlUtils.addChildNode(node, XmlNames.Elem.LastTopVisibleEntry),
            this.lastTopVisibleEntry
        );
        for (const group of this.groups) {
            group.write(node, ctx);
        }
        for (const entry of this.entries) {
            entry.write(node, ctx);
        }
    }

    *allGroups(): IterableIterator<KdbxGroup> {
        yield this;
        for (const group of this.groups) {
            for (const g of group.allGroups()) {
                yield g;
            }
        }
    }

    *allEntries(): IterableIterator<KdbxEntry> {
        for (const group of this.allGroups()) {
            for (const entry of group.entries) {
                yield entry;
            }
        }
    }

    *allGroupsAndEntries(): IterableIterator<KdbxGroup | KdbxEntry> {
        yield this;
        for (const entry of this.entries) {
            yield entry;
        }
        for (const group of this.groups) {
            for (const item of group.allGroupsAndEntries()) {
                yield item;
            }
        }
    }

    merge(objectMap: MergeObjectMap): void {
        const remoteGroup = objectMap.remoteGroups.get(this.uuid.id);
        if (!remoteGroup) {
            return;
        }
        if (remoteGroup.lastModTime > this.lastModTime) {
            this.copyFrom(remoteGroup);
        }
        this.groups = this.mergeCollection(
            this.groups,
            remoteGroup.groups,
            objectMap.groups,
            objectMap.remoteGroups,
            objectMap.deleted
        );
        this.entries = this.mergeCollection(
            this.entries,
            remoteGroup.entries,
            objectMap.entries,
            objectMap.remoteEntries,
            objectMap.deleted
        );
        for (const group of this.groups) {
            group.merge(objectMap);
        }
        for (const entry of this.entries) {
            entry.merge(objectMap);
        }
    }

    /**
     * Merge object collection with remote collection
     * Implements 2P-set CRDT with tombstones stored in objectMap.deleted
     * Assumes tombstones are already merged
     */
    private mergeCollection<T extends KdbxGroup | KdbxEntry>(
        collection: T[],
        remoteCollection: T[],
        objectMapItems: Map<string, T>,
        remoteObjectMapItems: Map<string, T>,
        deletedObjects: Map<string, Date>
    ): T[] {
        const newItems: T[] = [];
        for (const item of collection) {
            if (!item.uuid || deletedObjects.has(item.uuid.id)) {
                continue; // item deleted
            }
            const remoteItem = remoteObjectMapItems.get(item.uuid.id);
            if (!remoteItem) {
                newItems.push(item); // item added locally
            } else if (remoteItem.locationChanged <= item.locationChanged) {
                newItems.push(item); // item not changed or moved to this group locally later than remote
            }
        }
        let ix = -1;
        for (const remoteItem of remoteCollection) {
            ix++;
            if (!remoteItem.uuid || deletedObjects.has(remoteItem.uuid.id)) {
                continue; // item already processed as local item or deleted
            }
            const item = objectMapItems.get(remoteItem.uuid.id);

            if (item && remoteItem.locationChanged > item.locationChanged) {
                item.parentGroup = this; // item moved to this group remotely later than local
                newItems.splice(KdbxGroup.findInsertIx(newItems, remoteCollection, ix), 0, item);
            } else if (!item) {
                // item created remotely
                let newItem: T;
                if (remoteItem instanceof KdbxGroup) {
                    const group = new KdbxGroup();
                    group.copyFrom(remoteItem);
                    newItem = <T>group;
                } else if (remoteItem instanceof KdbxEntry) {
                    const entry = new KdbxEntry();
                    entry.copyFrom(remoteItem);
                    newItem = <T>entry;
                } else {
                    continue;
                }
                newItem.parentGroup = this;
                newItems.splice(KdbxGroup.findInsertIx(newItems, remoteCollection, ix), 0, newItem);
            }
        }
        return newItems;
    }

    /**
     * Finds a best place to insert new item into collection
     */
    private static findInsertIx<T extends KdbxGroup | KdbxEntry>(
        dst: T[],
        src: T[],
        srcIx: number
    ): number {
        let selectedIx = dst.length,
            selectedScore = -1;
        for (let dstIx = 0; dstIx <= dst.length; dstIx++) {
            let score = 0;
            const srcPrev = srcIx > 0 ? src[srcIx - 1].uuid.id : undefined,
                srcNext = srcIx + 1 < src.length ? src[srcIx + 1].uuid.id : undefined,
                dstPrev = dstIx > 0 ? dst[dstIx - 1].uuid.id : undefined,
                dstNext = dstIx < dst.length ? dst[dstIx].uuid.id : undefined;
            if (!srcPrev && !dstPrev) {
                score += 1; // start of sequence
            } else if (srcPrev === dstPrev) {
                score += 5; // previous element equals
            }
            if (!srcNext && !dstNext) {
                score += 2; // end of sequence
            } else if (srcNext === dstNext) {
                score += 5; // next element equals
            }
            if (score > selectedScore) {
                selectedIx = dstIx;
                selectedScore = score;
            }
        }
        return selectedIx;
    }

    copyFrom(group: KdbxGroup): void {
        this.uuid = group.uuid;
        this.name = group.name;
        this.notes = group.notes;
        this.icon = group.icon;
        this.customIcon = group.customIcon;
        this.times = group.times.clone();
        this.expanded = group.expanded;
        this.defaultAutoTypeSeq = group.defaultAutoTypeSeq;
        this.enableAutoType = group.enableAutoType;
        this.enableSearching = group.enableSearching;
        this.lastTopVisibleEntry = group.lastTopVisibleEntry;
    }

    static create(name: string, parentGroup?: KdbxGroup): KdbxGroup {
        const group = new KdbxGroup();
        group.uuid = KdbxUuid.random();
        group.icon = Icons.Folder;
        group.times = KdbxTimes.create();
        group.name = name;
        group.parentGroup = parentGroup;
        group.expanded = true;
        group.enableAutoType = null;
        group.enableSearching = null;
        group.lastTopVisibleEntry = new KdbxUuid();
        return group;
    }

    static read(xmlNode: Node, ctx: KdbxContext, parentGroup?: KdbxGroup): KdbxGroup {
        const grp = new KdbxGroup();
        for (let i = 0, cn = xmlNode.childNodes, len = cn.length; i < len; i++) {
            const childNode = <Element>cn[i];
            if (childNode.tagName) {
                grp.readNode(childNode, ctx);
            }
        }
        if (grp.uuid.empty) {
            // some clients don't write ids
            grp.uuid = KdbxUuid.random();
        }
        grp.parentGroup = parentGroup;
        return grp;
    }
}
