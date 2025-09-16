import { LogootDocument } from "../state/LogootDocument";

export interface Operation {
    apply(doc: LogootDocument): boolean;
    isApplicable(doc: LogootDocument): boolean;
    getType(): string;
    getSiteId(): string;
    toString(): string;
}