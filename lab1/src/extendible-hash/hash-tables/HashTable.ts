import { IHashTable } from "../IHashTable";
import { GlobalBucket } from "../buckets/GlobalBucket";
import { IEntry } from "../buckets/entries/IEntry";

export class HashTable implements IHashTable {
    private globalBucket: GlobalBucket;

    constructor() {
        this.globalBucket = new GlobalBucket();
    }

    put(key: number, value: number): boolean {
        return this.globalBucket.put(key, value);
    }

    get(key: number): number | null {
        return this.globalBucket.get(key);
    }

    delete(key: number): boolean {
        return this.globalBucket.delete(key);
    }

    getAllEntries(): IEntry[][] {
        return this.globalBucket.getEntries();
    }
}