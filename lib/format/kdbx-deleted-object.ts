import * as XmlUtils from '../utils/xml-utils';
import * as XmlNames from '../defs/xml-names';
import { KdbxUuid } from './kdbx-uuid';
import { KdbxContext } from './kdbx-context';

export class KdbxDeletedObject {
    uuid: KdbxUuid | undefined;
    deletionTime: Date | undefined;

    private readNode(node: Element): void {
        switch (node.tagName) {
            case XmlNames.Elem.Uuid:
                this.uuid = XmlUtils.getUuid(node);
                break;
            case XmlNames.Elem.DeletionTime:
                this.deletionTime = XmlUtils.getDate(node);
                break;
        }
    }

    write(parentNode: Node, ctx: KdbxContext): void {
        const node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.DeletedObject);
        XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.Uuid), this.uuid);
        ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.DeletionTime), this.deletionTime);
    }

    static read(xmlNode: Node): KdbxDeletedObject {
        const obj = new KdbxDeletedObject();
        for (let i = 0, cn = xmlNode.childNodes, len = cn.length; i < len; i++) {
            const childNode = <Element>cn[i];
            if (childNode.tagName) {
                obj.readNode(childNode);
            }
        }
        return obj;
    }
}
