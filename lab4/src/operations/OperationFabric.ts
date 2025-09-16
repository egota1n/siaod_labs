import { LogootDocument } from "../state/LogootDocument";
import { Operation } from "./Operation";

export interface OperationFabric {
    nextOperation(doc: LogootDocument, siteId: string): Operation | null;
}