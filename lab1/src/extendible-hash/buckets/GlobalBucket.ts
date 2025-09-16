import { IEntry } from "./entries/IEntry";
import { LocalBucket } from "./LocalBucket";
import { ILocalBucket } from "./ILocalBucket";
import { IGlobalBucket } from "../hash-tables/IGlobalBucket";

export class GlobalBucket implements IGlobalBucket {
    private localBuckets: Array<ILocalBucket | null>;
    private depth: number;
    private size: number;

    constructor() {
        this.depth = 2;
        this.size = Math.pow(2, this.depth);
        this.localBuckets = new Array(this.size).fill(null);
    }

    private extend(): void {
        this.incrementDepth();
        const newLocalBuckets: Array<ILocalBucket | null> = new Array(this.size).fill(null);
        for (let i = 0; i < this.localBuckets.length; i++) {
            newLocalBuckets[i] = this.localBuckets[i];
        }
        this.localBuckets = newLocalBuckets;
    }

    private incrementDepth(): void {
        this.depth++;
        this.size = Math.pow(2, this.depth);
    }

    private hash(n: number): number {
        return this.getLastBits(n, this.depth);
    }

    private getLastBits(n: number, bitsCnt: number): number {
        return n & ((1 << bitsCnt) - 1);
    }

    private tryRedistributeBucket(index: number): boolean {
        const oldBucket = this.localBuckets[index];
        if (!oldBucket || oldBucket.depth() >= this.depth) return false;

        this.localBuckets[index] = new LocalBucket(oldBucket.depth() + 1);
        for (const entry of oldBucket.getAll()) {
            this.put(entry.getKey(), entry.getValue());
        }
        return true;
    }

    private initLocalBucket(index: number): void {
        this.localBuckets[index] = new LocalBucket(this.depth);
    }

    put(key: number, value: number): boolean {
        if (key === null || key === undefined) return false;

        const index = this.hash(key);
        if (this.localBuckets[index] === null) {
            this.initLocalBucket(index);
        }

        if (!this.localBuckets[index]!.put(key, value)) {
            if (!this.tryRedistributeBucket(index)) {
                this.extend();
            }
            return this.put(key, value);
        }
        return true;
    }

    get(key: number): number | null {
        const index = this.hash(key);
        const localBucket = this.localBuckets[index];
        return localBucket ? localBucket.get(key) : null;
    }

    delete(key: number): boolean {
        const index = this.hash(key);
        const localBucket = this.localBuckets[index];
        return localBucket ? localBucket.delete(key) : false;
    }

    getEntries(): IEntry[][] {
        return this.localBuckets.map(bucket => (bucket ? bucket.getAll() : []));
    }
}