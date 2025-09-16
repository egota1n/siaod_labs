import { OperationImpl } from "./OperationImpl";
import { LogootAtom } from "../state/LogootAtom";
import { LogootDocument } from "../state/LogootDocument";

export class InsertOperation extends OperationImpl {
    readonly type = "insert";
    constructor(public atom: LogootAtom, public siteId: string) {
        super();
    }

    apply(doc: LogootDocument): boolean {
        return doc.applyInsertOperation(this);
    }

    isApplicable(doc: LogootDocument): boolean {
        return doc.isInsertable(this);
    }

    getType(): string {
        return this.type;
    }

    getSiteId(): string {
        return this.siteId;
    }

    toString(): string {
        return `${this.type}-${this.atom}-${this.siteId}`;
    }
}