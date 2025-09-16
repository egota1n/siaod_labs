import { Position } from "./Position";

export class LogootAtom {
    constructor(
        public readonly position: Position,
        public readonly value: string,
        private _isDeleted: boolean = false
    ) {}

    toString(): string {
        return `'${this.value}'@${this.position}${this._isDeleted ? ":deleted" : ""}`;
    }

    delete(): void {
        this._isDeleted = true;
    }

    restore(): void {
        this._isDeleted = false;
    }

    isDeleted(): boolean {
        return this._isDeleted;
    }
}