import { InsertionServer } from "./InsertionServer";
import { BroadcastQueue } from "./BroadcastQueue";
import { OperationFabric } from "../operations/OperationFabric";
import { OperationRandomTypeFabric } from "../operations/OperationRandomTypeFabric";
import { LogootDocument } from "../state/LogootDocument";
import { v4 as uuidv4 } from "uuid";

export class RandomServer extends InsertionServer {
    constructor(queue: BroadcastQueue, siteIds: string[], siteId: string, seed: number) {
        super(queue, siteIds, siteId, seed);
    }

    protected initOperationFabric(seed: number): OperationFabric {
        return new OperationRandomTypeFabric(seed);
    }
}