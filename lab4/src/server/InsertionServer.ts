import { Server } from "./Server";
import { BroadcastQueue } from "./BroadcastQueue";
import { LogootDocument } from "../state/LogootDocument";
import { LogootAtom } from "../state/LogootAtom";
import { OperationFabric } from "../operations/OperationFabric";
import { OperationRandomFabric } from "../operations/OperationRandomFabric";
import { Operation } from "../operations/Operation";
import { TerminationSignal } from "../operations/TerminationSignal";
import { sleep } from "../utils/sleep"; // утилита sleep(ms): Promise<void>

export class InsertionServer extends Server {
    private logoot: LogootDocument;
    public siteId: string;
    private queue: BroadcastQueue;
    private isTerminated: Map<string, boolean> = new Map();
    private operationFabric: OperationFabric;
    private localOpsQuota: number;
    private localOpsComplete = 0;

    constructor(queue: BroadcastQueue, siteIds: string[], siteId: string, seed: number, localOpsQuota = 10) {
        super();
        this.queue = queue;
        this.siteId = siteId;
        this.logoot = new LogootDocument(siteId);
        this.localOpsQuota = localOpsQuota;

        for (const id of siteIds) {
            this.isTerminated.set(id, false);
        }

        this.operationFabric = this.initOperationFabric(seed);

        const start = this.logoot.generateStartPosition();
        const end = this.logoot.generateEndPosition();

        const startAtom = new LogootAtom(start, "");
        const endAtom = new LogootAtom(end, "");

        this.logoot.insertAtom(startAtom);
        this.logoot.insertAtom(endAtom);
    }

    async run(): Promise<LogootDocument> {
        while (true) {
            const lastMessages = await this.queue.getNewMessages(this.siteId);
            if (await this.breakIfTermination(lastMessages)) {
                console.log(this.siteId, "all terminated. Breaking.");
                break;
            }

            this.synchronize(lastMessages);

            await sleep(10);

            if (this.localOpsComplete < this.localOpsQuota) {
                const operation: Operation | null = this.operationFabric.nextOperation(this.logoot, this.siteId);
                console.log(this.siteId, "generated local op", operation);
                this.localOpsComplete++;

                if (!operation) {
                    console.log(this.siteId, "Operation is null.");
                    continue;
                }

                const applied = operation.apply(this.logoot);
                console.log(this.siteId, "operation", operation.getType(), "applied?", applied);

                if (applied) {
                    await this.queue.addMessage(JSON.stringify(operation), this.siteId);
                }
            } else {
                console.log(this.siteId, "local ops quota exceeded");
            }
        }
        return this.logoot;
    }

    async breakIfTermination(lastMessages: string[]): Promise<boolean> {
        if (this.isTerminated.get(this.siteId)) {
            await sleep(20);
            const allTerminated = Array.from(this.isTerminated.values()).every((v) => v);
            if (allTerminated && lastMessages.length === 0 && this.getOpStashSize() > 0) {
                console.warn(this.siteId, "stash not empty after everybody is terminated.", this.stashedOperations);
            }
            return allTerminated && lastMessages.length === 0;
        } else if (this.localOpsComplete === this.localOpsQuota) {
            this.isTerminated.set(this.siteId, true);
            await this.queue.addMessage(JSON.stringify(new TerminationSignal(this.siteId)), this.siteId);
            await sleep(20);
        }
        return false;
    }

    getLogootDoc(): LogootDocument {
        return this.logoot;
    }

    getSiteId(): string {
        return this.siteId;
    }

    setTerminated(siteId: string): void {
        this.isTerminated.set(siteId, true);
    }

    protected initOperationFabric(seed: number): OperationFabric {
        return new OperationRandomFabric("insert", seed);
    }
}