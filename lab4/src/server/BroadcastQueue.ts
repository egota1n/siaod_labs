import { randomInt } from "crypto";

export class BroadcastQueue {
    private channels: Map<string, string[]> = new Map();
    private siteIds: string[];
    private sendLock = false; // Простейший mutex (однопоточный TS)
    private rngSeed = 100; // чтобы было детерминировано
    private random = () => Math.floor(Math.random() * 1000);

    constructor(siteIds: string[]) {
        this.siteIds = siteIds;
        for (const id of siteIds) {
            this.channels.set(id, []);
        }
    }

    async addMessage(message: string, siteId: string) {
        // "mutex"
        while (this.sendLock) {
            await new Promise(r => setTimeout(r, 1));
        }
        this.sendLock = true;
        try {
            for (const id of this.siteIds) {
                if (id === siteId) continue;
                this.channels.get(id)!.push(message);
            }
        } finally {
            this.sendLock = false;
        }
    }

    async getNewMessages(siteId: string): Promise<string[]> {
        const channel = this.channels.get(siteId);
        if (!channel) return [];

        const newMessages: string[] = [];
        let attempts = 0;
        const MAX_ATTEMPTS = 20;

        while (channel.length > 0) {
            if (attempts >= MAX_ATTEMPTS) break;
            const msg = channel.shift();
            if (!msg) {
                attempts++;
                await new Promise(r => setTimeout(r, 10 + (this.random() % 10)));
                continue;
            }
            newMessages.push(msg);
        }

        // случайная перестановка
        for (let i = newMessages.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newMessages[i], newMessages[j]] = [newMessages[j], newMessages[i]];
        }

        return newMessages;
    }
}