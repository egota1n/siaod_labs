import { OperationImpl } from "./OperationImpl";
import { LogootAtom } from "../state/LogootAtom";
import { LogootDocument } from "../state/LogootDocument";

export class DeleteOperation extends OperationImpl {
    readonly type = "delete";
    constructor(public atom: LogootAtom, public siteId: string) {
        super();
    }

    apply(doc: LogootDocument): boolean {
        return doc.deleteAtom(this.atom);
    }

    isApplicable(doc: LogootDocument): boolean {
        return doc.isDeletable(this.atom);
    }

    getType(): string {
        return this.type;
    }

    getSiteId(): string {
        return this.siteId;
    }

    getPos() {
        return this.atom.position;
    }

    toString(): string {
        return `${this.type}-${this.atom}-${this.siteId}`;
    }
}