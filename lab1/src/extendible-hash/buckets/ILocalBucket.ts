import { IEntry } from "./entries/IEntry";

export interface ILocalBucket {
    put(key: number, value: number): boolean;
    delete(key: number): boolean;
    get(key: number): number | null;
    getAll(): IEntry[];
    depth(): number;
}