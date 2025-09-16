import { LocalBucket } from "./LocalBucket";

describe("LocalBucket", () => {
    let localBucket: LocalBucket;

    beforeEach(() => {
        localBucket = new LocalBucket(3);
    });

    test("put stores entry", () => {
        localBucket.put(37, 18);
        expect(localBucket.get(37)).toBe(18);
    });

    test("delete removes entry", () => {
        localBucket.put(37, 18);
        expect(localBucket.get(37)).toBe(18);
        localBucket.delete(37);
        expect(localBucket.get(37)).toBeNull();
    });

    test("get retrieves value", () => {
        localBucket.put(37, 18);
        expect(localBucket.get(37)).toBe(18);
    });

    test("depth returns correct depth", () => {
        expect(localBucket.depth()).toBe(3);
    });

    test("getAll returns all entries", () => {
        localBucket.put(37, 18);
        localBucket.put(33, 44);
        const entries = localBucket.getAll();
        expect(entries[0].getKey()).toBe(37);
        expect(entries[1].getKey()).toBe(33);
        expect(entries[0].getValue()).toBe(18);
        expect(entries[1].getValue()).toBe(44);
    });
});