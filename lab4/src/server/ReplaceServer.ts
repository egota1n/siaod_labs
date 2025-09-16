import { InsertionServer } from "./InsertionServer";
import { BroadcastQueue } from "./BroadcastQueue";
import { OperationFabric } from "../operations/OperationFabric";
import { OperationRandomFabric } from "../operations/OperationRandomFabric";
import { LogootDocument } from "../state/LogootDocument";
import { v4 as uuidv4 } from "uuid";

export class ReplaceServer extends InsertionServer {
    constructor(queue: BroadcastQueue, siteIds: string[], siteId: string, seed: number, localOpsQuota?: number) {
        super(queue, siteIds, siteId, seed, localOpsQuota);
    }

    protected initOperationFabric(seed: number): OperationFabric {
        return new OperationRandomFabric("replace", seed);
    }
}