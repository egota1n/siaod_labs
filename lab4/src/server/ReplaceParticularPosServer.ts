import { InsertionServer } from "./InsertionServer";
import { BroadcastQueue } from "./BroadcastQueue";
import { OperationFabric } from "../operations/OperationFabric";
import { OperationPaticularPosRandomFabric } from "../operations/OperationPaticularPosRandomFabric";
import { Position } from "../state/Position";
import { VectorClock } from "../state/VectorClock";
import { LogootDocument } from "../state/LogootDocument";
import { v4 as uuidv4 } from "uuid";

export class ReplaceParticularPosServer extends InsertionServer {
    constructor(queue: BroadcastQueue, siteIds: string[], siteId: string, seed: number, localOpsQuota?: number) {
        super(queue, siteIds, siteId, seed, localOpsQuota);
    }

    protected initOperationFabric(seed: number): OperationFabric {
        const pos = new Position([1], this.siteId, new VectorClock());
        return new OperationPaticularPosRandomFabric(pos, seed);
    }
}