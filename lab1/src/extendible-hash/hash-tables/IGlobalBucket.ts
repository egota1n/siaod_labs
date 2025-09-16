import { IEntry } from "../buckets/entries/IEntry";

export interface IGlobalBucket {
    put(key: number, value: number): boolean;
    get(key: number): number | null;
    delete(key: number): boolean;
    getEntries(): IEntry[][];
}