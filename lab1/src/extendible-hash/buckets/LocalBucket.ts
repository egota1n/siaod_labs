import { ILocalBucket } from "./ILocalBucket";
import { IEntry } from "./entries/IEntry";
import { Entry } from "./entries/Entry";

export class LocalBucket implements ILocalBucket {
    private static readonly CAPACITY = 10;
    private entries: IEntry[];
    private _depth: number;

    constructor(depth: number) {
        this.entries = [];
        this._depth = depth;
    }

    put(key: number, value: number): boolean {
        if (this.entries.length >= LocalBucket.CAPACITY) {
            return false;
        }
        this.entries.push(new Entry(key, value));
        return true;
    }

    delete(key: number): boolean {
        const index = this.entries.findIndex(e => e.getKey() === key);
        if (index !== -1) {
            this.entries.splice(index, 1);
            return true;
        }
        return false;
    }

    get(key: number): number | null {
        const entry = this.entries.find(e => e.getKey() === key);
        return entry ? entry.getValue() : null;
    }

    depth(): number {
        return this._depth;
    }

    getAll(): IEntry[] {
        return [...this.entries];
    }
}