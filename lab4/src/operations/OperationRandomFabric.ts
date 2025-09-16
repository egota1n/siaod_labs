import { OperationFabric } from "./OperationFabric";
import { LogootDocument } from "../state/LogootDocument";
import { LogootRandomWordWriter } from "../state/LogootRandomWordWriter";

export class OperationRandomFabric implements OperationFabric {
    private logootRandomWordWriter: LogootRandomWordWriter;

    constructor(private mode: "insert" | "delete" | "replace", seed: number) {
        this.logootRandomWordWriter = new LogootRandomWordWriter(seed);
    }

    nextOperation(doc: LogootDocument, siteId: string) {
        switch (this.mode) {
            case "insert":
                return this.logootRandomWordWriter.genRandomInsertOperation(doc, siteId);
            case "delete":
                return this.logootRandomWordWriter.genRandomDeleteOperation(doc, siteId);
            case "replace":
                return this.logootRandomWordWriter.genRandomReplaceOperation(doc, siteId);
            default:
                return null;
        }
    }

    nextParticularWordInsertOperation(
        doc: LogootDocument,
        siteId: string,
        word: string
    ) {
        return this.logootRandomWordWriter.genRandomInsertOperation(doc, siteId);
    }
}