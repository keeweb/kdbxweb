import * as XmlUtils from '../utils/xml-utils';
import * as XmlNames from '../defs/xml-names';

export type KdbxCustomDataMap = Map<string, string | null>;

export class KdbxCustomData {
    static read(node: Node): KdbxCustomDataMap {
        const customData = new Map<string, string | null>();
        for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
            const childNode = <Element>cn[i];
            if (childNode.tagName === XmlNames.Elem.StringDictExItem) {
                this.readItem(childNode, customData);
            }
        }
        return customData;
    }

    static write(parentNode: Node, customData: KdbxCustomDataMap | undefined): void {
        if (!customData) {
            return;
        }
        const node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.CustomData);
        for (const [key, value] of customData) {
            if (value) {
                const itemNode = XmlUtils.addChildNode(node, XmlNames.Elem.StringDictExItem);
                XmlUtils.setText(XmlUtils.addChildNode(itemNode, XmlNames.Elem.Key), key);
                XmlUtils.setText(XmlUtils.addChildNode(itemNode, XmlNames.Elem.Value), value);
            }
        }
    }

    private static readItem(node: Element, customData: KdbxCustomDataMap): void {
        let key, value;
        for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
            const childNode = <Element>cn[i];
            switch (childNode.tagName) {
                case XmlNames.Elem.Key:
                    key = XmlUtils.getText(childNode);
                    break;
                case XmlNames.Elem.Value:
                    value = XmlUtils.getText(childNode);
                    break;
            }
        }
        if (key && value !== undefined) {
            customData.set(key, value);
        }
    }
}
