import { HashTable } from "./HashTable";

describe("HashTable", () => {
    let hashTable: HashTable;

    beforeEach(() => {
        hashTable = new HashTable();
    });

    test("put inserts value", () => {
        hashTable.put(7, 17);
        expect(hashTable.get(7)).toBe(17);
    });

    test("get retrieves value", () => {
        hashTable.put(7, 17);
        expect(hashTable.get(7)).toBe(17);
    });

    test("delete removes value", () => {
        hashTable.put(7, 17);
        expect(hashTable.get(7)).toBe(17);
        hashTable.delete(7);
        expect(hashTable.get(7)).toBeNull();
    });
});