import { Entry } from "./Entry";

describe("Entry", () => {
    let entry: Entry;

    beforeEach(() => {
        entry = new Entry(57, 15);
    });

    test("getKey", () => {
        expect(entry.getKey()).toBe(57);
    });

    test("getValue", () => {
        expect(entry.getValue()).toBe(15);
    });

    test("setKey", () => {
        entry.setKey(163);
        expect(entry.getKey()).toBe(163);
    });

    test("setValue", () => {
        entry.setValue(432);
        expect(entry.getValue()).toBe(432);
    });
});