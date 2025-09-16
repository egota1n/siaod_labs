import { IEntry } from "./IEntry";

export class Entry implements IEntry {
    private key: number;
    private value: number;

    constructor(key: number, value: number) {
        this.key = key;
        this.value = value;
    }

    getKey(): number {
        return this.key;
    }

    getValue(): number {
        return this.value;
    }

    setKey(key: number): void {
        this.key = key;
    }

    setValue(value: number): void {
        this.value = value;
    }
}