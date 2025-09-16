import { OperationFabric } from "./OperationFabric";
import { LogootDocument } from "../state/LogootDocument";
import { OperationRandomFabric } from "./OperationRandomFabric";

export class OperationSimultaneousEditFabric implements OperationFabric {
    private insertFabric: OperationRandomFabric;
    private replaceFabric: OperationRandomFabric;
    private cnt = 0;

    constructor(seed: number) {
        this.insertFabric = new OperationRandomFabric("insert", seed);
        this.replaceFabric = new OperationRandomFabric("replace", seed);
    }

    nextOperation(doc: LogootDocument, siteId: string) {
        if (this.cnt === 0) {
            this.cnt++;
            return this.insertFabric.nextParticularWordInsertOperation(
                doc,
                siteId,
                "testword"
            );
        }
        return this.replaceFabric.nextOperation(doc, siteId);
    }
}