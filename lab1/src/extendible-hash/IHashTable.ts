import { IEntry } from "./buckets/entries/IEntry";

export interface IHashTable {
    put(key: number, value: number): boolean;
    get(key: number): number | null;
    delete(key: number): boolean;
    getAllEntries(): IEntry[][];
}