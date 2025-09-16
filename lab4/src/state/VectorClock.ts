export class VectorClock {
    public clock: Map<string, number>;

    constructor(siteIds?: string[] | VectorClock) {
        this.clock = new Map();

        if (siteIds instanceof VectorClock) {
            // copy constructor
            for (const [k, v] of siteIds.clock.entries()) {
                this.clock.set(k, v);
            }
        } else if (Array.isArray(siteIds)) {
            for (const id of siteIds) {
                this.clock.set(id, 0);
            }
        }
    }

    increase(siteId: string) {
        const val = this.clock.get(siteId) ?? 0;
        this.clock.set(siteId, val + 1);
    }

    compareTo(other: VectorClock): number {
        if (this.clock.size !== other.clock.size) {
            throw new Error("Clocks sizes don't match.");
        }

        const diffs = [...this.clock.keys()].map(
            (k) => (this.clock.get(k) ?? 0) - (other.clock.get(k) ?? 0)
        );

        const anyNeg = diffs.some((d) => d < 0);
        const anyPos = diffs.some((d) => d > 0);
        const allZero = diffs.every((d) => d === 0);

        if (allZero || (anyPos && anyNeg)) return 0;
        if (anyNeg) return -1;
        if (anyPos) return 1;

        throw new Error("Unexpected vector clock comparison result.");
    }

    toString(): string {
        return [...this.clock.values()].join(":");
    }

    static merge(c1: VectorClock, c2: VectorClock): VectorClock {
        const res = new VectorClock();
        for (const key of c1.clock.keys()) {
            res.clock.set(
                key,
                Math.max(c1.clock.get(key) ?? 0, c2.clock.get(key) ?? 0)
            );
        }
        return res;
    }

    isBegin(): boolean {
        return [...this.clock.values()].every((v) => v === 0);
    }

    missedMessageExists(vc: VectorClock): boolean {
        const diffs = [...vc.clock.keys()].map(
            (k) => (vc.clock.get(k) ?? 0) - (this.clock.get(k) ?? 0)
        );
        const anyNeg = diffs.some((d) => d < 0);
        const anyPos = diffs.some((d) => d > 0);
        if (anyNeg && anyPos) return false;
        return diffs.some((d) => Math.abs(d) > 1);
    }
}