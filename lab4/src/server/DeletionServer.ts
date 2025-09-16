import { Server } from "./Server";
import { BroadcastQueue } from "./BroadcastQueue";
import { LogootDocument } from "../state/LogootDocument";
import { OperationFabric } from "../operations/OperationFabric";
import { OperationRandomFabric } from "../operations/OperationRandomFabric";
import { Operation } from "../operations/Operation";
import { TerminationSignal } from "../operations/TerminationSignal";
import { sleep } from "../utils/sleep";
import {LogootAtom} from "../state/LogootAtom";

export class DeletionServer extends Server {
    private logoot: LogootDocument;
    public siteId: string;
    private queue: BroadcastQueue;
    private isTerminated: Map<string, boolean> = new Map();
    private operationFabric: OperationFabric;

    constructor(queue: BroadcastQueue, siteIds: string[], siteId: string, seed: number) {
        super();
        this.queue = queue;
        this.siteId = siteId;
        this.logoot = new LogootDocument(siteId);

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
                break;
            }

            const operation: Operation | null = this.operationFabric.nextOperation(this.logoot, this.siteId);
            if (operation) {
                operation.apply(this.logoot);
                await this.queue.addMessage(JSON.stringify(operation), this.siteId);
            }

            this.synchronize(lastMessages);
        }
        return this.logoot;
    }

    async breakIfTermination(lastMessages: string[]): Promise<boolean> {
        const allTerminated = Array.from(this.isTerminated.entries())
            .filter(([k]) => k !== this.siteId)
            .every(([, v]) => v);

        if (allTerminated && this.getOpStashSize() > 0) {
            console.warn(this.siteId, "stash not empty after everybody is terminated.", this.stashedOperations);
        }

        if (allTerminated) {
            this.isTerminated.set(this.siteId, true);
            await this.queue.addMessage(JSON.stringify(new TerminationSignal(this.siteId)), this.siteId);
            return lastMessages.length === 0 && this.logoot.size() <= 2;
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
        return new OperationRandomFabric("delete", seed);
    }
}