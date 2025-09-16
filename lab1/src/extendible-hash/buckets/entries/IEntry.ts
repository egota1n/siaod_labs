export interface IEntry {
    getKey(): number;
    getValue(): number;
    setKey(key: number): void;
    setValue(value: number): void;
}