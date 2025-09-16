import { GlobalBucket } from "./GlobalBucket";
import { LocalBucket } from "./LocalBucket";

describe("GlobalBucket", () => {
    let globalBucket: any;

    beforeEach(() => {
        globalBucket = new GlobalBucket();
    });

    test("extend updates size", () => {
        expect(globalBucket["size"]).toBe(4);
        for (let i = 0; i < 41; i++) {
            globalBucket.put(i, i + 1);
        }
        expect(globalBucket["size"]).toBe(8);
    });

    test("incrementDepth increases depth", () => {
        expect(globalBucket["depth"]).toBe(2);
        for (let i = 0; i < 41; i++) {
            globalBucket.put(i, i + 1);
        }
        expect(globalBucket["depth"]).toBe(3);
    });

    test("hash works correctly", () => {
        expect((globalBucket as any).hash(7)).toBe(3);
    });

    test("getLastBits works correctly", () => {
        expect((globalBucket as any).getLastBits(7, 2)).toBe(3);
    });

    test("initLocalBucket creates LocalBucket", () => {
        expect((globalBucket as any).localBuckets[0]).toBeNull();
        (globalBucket as any).initLocalBucket(0);
        expect((globalBucket as any).localBuckets[0]).toBeInstanceOf(LocalBucket);
    });

    test("put inserts key-value", () => {
        globalBucket.put(112, 225);
        expect(globalBucket.get(112)).toBe(225);
    });

    test("get retrieves value", () => {
        globalBucket.put(112, 225);
        expect(globalBucket.get(112)).toBe(225);
    });

    test("delete removes entry", () => {
        globalBucket.put(112, 225);
        expect(globalBucket.get(112)).toBe(225);
        globalBucket.delete(112);
        expect(globalBucket.get(112)).toBeNull();
    });
});