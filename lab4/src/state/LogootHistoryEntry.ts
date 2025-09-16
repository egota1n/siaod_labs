import { LogootAtom } from "./LogootAtom";

export class LogootHistoryEntry {
    public readonly date: Date;

    constructor(
        public atoms: LogootAtom[],
        public lastOperationType: string,
        public lastOperationDetails: string
    ) {
        this.date = new Date();
    }

    atomsToString(): string {
        return this.atoms.map((a) => a.toString()).join(" ");
    }

    toString(): string {
        return `${this.lastOperationType} ${this.lastOperationDetails}\n ${this.atomsToString()}\n`;
    }
}