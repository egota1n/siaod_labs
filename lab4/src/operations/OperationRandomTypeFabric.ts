import { OperationFabric } from "./OperationFabric";
import { OperationRandomFabric } from "./OperationRandomFabric";
import { LogootDocument } from "../state/LogootDocument";

export class OperationRandomTypeFabric implements OperationFabric {
    private randomFabrics: OperationRandomFabric[];
    private random: () => number;

    constructor(seed: number) {
        this.randomFabrics = [
            new OperationRandomFabric("insert", seed),
            new OperationRandomFabric("delete", seed),
        ];
        this.random = () => Math.random(); // можно подключить seedrandom
    }

    nextOperation(doc: LogootDocument, siteId: string) {
        const fabric =
            this.randomFabrics[Math.floor(this.random() * this.randomFabrics.length)];
        return fabric.nextOperation(doc, siteId);
    }
}