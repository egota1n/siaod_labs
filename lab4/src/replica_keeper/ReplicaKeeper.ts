import { Server } from "../server/Server";
import { LogootDocument } from "../state/LogootDocument";
import { TerminationSignal } from "../operations/TerminationSignal";
import { BroadcastQueue } from "../server/BroadcastQueue";

export class ReplicaKeeper {
    public static siteIds: string[] = [];
    public serversCnt: number;
    public servers: Server[];
    public documents: LogootDocument[];
    public broadcastQueue: BroadcastQueue;

    constructor(servers: Server[]) {
        this.serversCnt = servers.length;
        this.servers = servers;

        // Генерация уникальных siteId и создание документов
        this.documents = servers.map((_, idx) => {
            const siteId = `site${idx + 1}`;
            ReplicaKeeper.siteIds.push(siteId);
            return new LogootDocument(siteId);
        });

        // Создаем общую BroadcastQueue
        this.broadcastQueue = new BroadcastQueue(ReplicaKeeper.siteIds);

        // Передаем каждому серверу очередь
        for (const server of this.servers) {
            server.setBroadcastQueue(this.broadcastQueue);
        }
    }

    /**
     * Применяет операцию к конкретной реплике
     */
    applyOperation(siteIndex: number, op: any) {
        const doc = this.documents[siteIndex];

        if (op instanceof TerminationSignal) {
            console.log(`Replica ${siteIndex} (siteId=${op.siteId}) завершила работу.`);
            return;
        }

        switch (op.type) {
            case "insert":
                doc.insertAtom(op.atom);
                break;
            case "delete":
                doc.deleteAtom(op.atom);
                break;
            case "replace":
                doc.replaceAtom(op.atom);
                break;
            default:
                console.warn("Unsupported operation:", op);
        }
    }

    /**
     * Запускает все реплики и применяет операции
     */
    async runReplicas(): Promise<LogootDocument[]> {
        const promises: Promise<LogootDocument>[] = this.servers.map(
            async (server, idx) => {
                const ops = await server.run();

                const operations = Array.isArray(ops) ? ops : [ops];

                for (const op of operations) {
                    this.applyOperation(idx, op);
                }

                return this.documents[idx];
            }
        );

        return await Promise.all(promises);
    }
}