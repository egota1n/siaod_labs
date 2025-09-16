import { Server } from "../server/Server";
import { LogootDocument } from "../state/LogootDocument";

export class ReplicaKeeper {
    public static siteIds: string[] = [];
    public serversCnt: number;
    public servers: Server[];

    constructor(servers: Server[]) {
        this.serversCnt = 3; // как Server.REPLICAS_CNT
        this.servers = servers;
    }

    async runReplicas(): Promise<LogootDocument[]> {
        // Преобразуем результат run() в Promise
        const promises: Promise<LogootDocument>[] = this.servers.map(
            server => Promise.resolve(server.run())
        );
        const outputs = await Promise.all(promises);
        return outputs;
    }
}