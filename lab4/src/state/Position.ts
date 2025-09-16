import { VectorClock } from "./VectorClock";

export class Position {
    constructor(
        public readonly digits: number[],
        public readonly siteId: string,
        public readonly clock: VectorClock
    ) {}

    compareTo(other: Position): number {
        const cmpDigits = this.compareOnlyDigits(other);
        if (cmpDigits !== 0) return cmpDigits;

        const cmpClock = this.clock.compareTo(other.clock);
        if (cmpClock !== 0) return cmpClock;

        return this.siteId.localeCompare(other.siteId);
    }

    compareOnlyDigits(other: Position): number {
        const minLen = Math.min(this.digits.length, other.digits.length);
        for (let i = 0; i < minLen; i++) {
            if (this.digits[i] !== other.digits[i]) {
                return this.digits[i] - other.digits[i];
            }
        }
        // Более короткая позиция считается "больше"
        return other.digits.length - this.digits.length;
    }

    toString(): string {
        return `${JSON.stringify(this.digits)}:${this.siteId.slice(-4)}:${this.clock}`;
    }
}