import { ReplicaKeeper } from "./replica_keeper/ReplicaKeeper";
import { InsertionServer } from "./server/InsertionServer";
import { BroadcastQueue } from "./server/BroadcastQueue";
import { LogootDocument } from "./state/LogootDocument";
import { v4 as uuidv4 } from "uuid";

async function main() {
    const serversCnt = 3;
    const siteIds: string[] = [];

    for (let i = 0; i < serversCnt; i++) {
        siteIds.push(uuidv4());
    }
    ReplicaKeeper.siteIds = siteIds;

    const queue = new BroadcastQueue(siteIds);

    const servers: InsertionServer[] = [];
    for (let i = 0; i < serversCnt; i++) {
        const server = new InsertionServer(queue, siteIds, siteIds[i], i + 25);
        servers.push(server);
    }

    const replicaKeeper = new ReplicaKeeper(servers);
    const outputs: LogootDocument[] = await replicaKeeper.runReplicas();

    for (let i = 0; i < outputs.length; i++) {
        const doc = outputs[i];
        console.log(`${doc.siteId}: ${doc.getTextDetailed()}`);
    }
}

main().catch(console.error);