import * as XmlUtils from '../utils/xml-utils';
import * as XmlNames from '../defs/xml-names';
import { KdbxContext } from './kdbx-context';

export type KdbxCustomDataItem = { value: string | undefined; lastModified?: Date | undefined };

export type KdbxCustomDataMap = Map<string, KdbxCustomDataItem>;

export class KdbxCustomData {
    static read(node: Node): KdbxCustomDataMap {
        const customData = new Map<string, KdbxCustomDataItem>();
        for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
            const childNode = <Element>cn[i];
            if (childNode.tagName === XmlNames.Elem.StringDictExItem) {
                this.readItem(childNode, customData);
            }
        }
        return customData;
    }

    static write(
        parentNode: Node,
        ctx: KdbxContext,
        customData: KdbxCustomDataMap | undefined
    ): void {
        if (!customData) {
            return;
        }
        const node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.CustomData);
        for (const [key, item] of customData) {
            if (item?.value) {
                const itemNode = XmlUtils.addChildNode(node, XmlNames.Elem.StringDictExItem);
                XmlUtils.setText(XmlUtils.addChildNode(itemNode, XmlNames.Elem.Key), key);
                XmlUtils.setText(XmlUtils.addChildNode(itemNode, XmlNames.Elem.Value), item.value);
                if (item.lastModified && ctx.kdbx.versionIsAtLeast(4, 1)) {
                    XmlUtils.setDate(
                        XmlUtils.addChildNode(itemNode, XmlNames.Elem.LastModTime),
                        item.lastModified
                    );
                }
            }
        }
    }

    private static readItem(node: Element, customData: KdbxCustomDataMap): void {
        let key, value, lastModified;
        for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
            const childNode = <Element>cn[i];
            switch (childNode.tagName) {
                case XmlNames.Elem.Key:
                    key = XmlUtils.getText(childNode);
                    break;
                case XmlNames.Elem.Value:
                    value = XmlUtils.getText(childNode);
                    break;
                case XmlNames.Elem.LastModTime:
                    lastModified = XmlUtils.getDate(childNode);
                    break;
            }
        }
        if (key && value !== undefined) {
            const item: KdbxCustomDataItem = { value };
            if (lastModified) {
                item.lastModified = lastModified;
            }
            customData.set(key, item);
        }
    }
}
