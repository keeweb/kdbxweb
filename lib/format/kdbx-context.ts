import * as XmlUtils from './../utils/xml-utils';
import { Kdbx } from './kdbx';

export class KdbxContext {
    readonly kdbx: Kdbx;
    exportXml: boolean;

    constructor(opts: { kdbx: Kdbx; exportXml?: boolean }) {
        this.kdbx = opts.kdbx;
        this.exportXml = !!opts.exportXml;
    }

    setXmlDate(node: Node, dt: Date | undefined): void {
        const isBinary = this.kdbx.versionMajor >= 4 && !this.exportXml;
        XmlUtils.setDate(node, dt, isBinary);
    }
}
