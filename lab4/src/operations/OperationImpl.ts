import { Operation } from "./Operation";
import { LogootDocument } from "../state/LogootDocument";

export abstract class OperationImpl implements Operation {
    abstract apply(doc: LogootDocument): boolean;
    abstract isApplicable(doc: LogootDocument): boolean;
    abstract getType(): string;
    abstract getSiteId(): string;
    abstract toString(): string;
}