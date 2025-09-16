import { OperationImpl } from "./OperationImpl";
import { LogootAtom } from "../state/LogootAtom";
import { LogootDocument } from "../state/LogootDocument";

export class ReplaceOperation extends OperationImpl {
    readonly type = "replace";
    constructor(
        public atom: LogootAtom,
        public oldVal: string,
        public siteId: string
    ) {
        super();
    }

    apply(doc: LogootDocument): boolean {
        return doc.replaceAtom(this.atom);
    }

    isApplicable(doc: LogootDocument): boolean {
        return doc.isReplaceable(this.atom, this.oldVal);
    }

    getType(): string {
        return this.type;
    }

    getSiteId(): string {
        return this.siteId;
    }

    toString(): string {
        return `${this.type}-${this.oldVal}-${this.atom}-${this.siteId}`;
    }
}