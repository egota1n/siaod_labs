import { LogootAtom } from "./LogootAtom";
import { Position } from "./Position";
import { LogootHistoryEntry } from "./LogootHistoryEntry";
import { VectorClock } from "./VectorClock";
import { InsertOperation } from "../operations/InsertOperation";

export class LogootDocument {
    private atoms: LogootAtom[] = [];
    private history: LogootHistoryEntry[] = [];

    constructor(public readonly siteId: string) {}

    generatePositionBetween(before: Position, after: Position): Position {
        const newDigits: number[] = [];
        let prefixLength = 0;
        const minLength = Math.min(before.digits.length, after.digits.length);

        while (
            prefixLength < minLength &&
            before.digits[prefixLength] === after.digits[prefixLength]
            ) {
            newDigits.push(before.digits[prefixLength]);
            prefixLength++;
        }

        if (prefixLength === after.digits.length && prefixLength < before.digits.length) {
            newDigits.push(before.digits[prefixLength] + 1);
        } else if (prefixLength < before.digits.length && prefixLength < after.digits.length) {
            const positiveDiffIndex = this.findIndexWithPositiveDiff(before, after);
            if (
                Math.abs(before.digits[positiveDiffIndex] - after.digits[positiveDiffIndex]) >
                1
            ) {
                newDigits.push(...before.digits.slice(0, positiveDiffIndex));
                newDigits.push(before.digits[positiveDiffIndex] + 1);
            } else {
                if (
                    positiveDiffIndex === before.digits.length - 1 &&
                    positiveDiffIndex === after.digits.length - 1
                ) {
                    newDigits.push(...after.digits.slice(positiveDiffIndex));
                    newDigits.push(0);
                } else if (positiveDiffIndex < before.digits.length - 1) {
                    newDigits.push(...before.digits.slice(0, positiveDiffIndex));
                    newDigits.push(before.digits[positiveDiffIndex + 1] + 1);
                } else {
                    if (after.digits[positiveDiffIndex + 1] === 0) {
                        newDigits.push(...after.digits.slice(positiveDiffIndex));
                        newDigits.push(0);
                    } else {
                        newDigits.push(...after.digits.slice(0, positiveDiffIndex));
                        newDigits.push(after.digits[positiveDiffIndex] - 1);
                    }
                }
            }
        }

        return new Position(newDigits, this.siteId, new VectorClock(before.clock));
    }

    findIndexWithPositiveDiff(pos1: Position, pos2: Position): number {
        for (let i = 0; i < pos1.digits.length && i < pos2.digits.length; i++) {
            if (Math.abs(pos1.digits[i] - pos2.digits[i]) > 0) return i;
        }
        return -1;
    }

    generateStartPosition(): Position {
        return new Position([0], this.siteId, new VectorClock());
    }

    generateEndPosition(): Position {
        return new Position([Number.MAX_SAFE_INTEGER], this.siteId, new VectorClock());
    }

    getAtoms(): LogootAtom[] {
        return this.atoms;
    }

    insertAtom(atom: LogootAtom) {
        let index = this.findPositionIndex(atom.position);
        if (index < 0) index = -(index + 1);

        this.atoms.splice(index, 0, atom);
        this.history.push(new LogootHistoryEntry([...this.atoms], "insert", atom.toString()));
    }

    deleteAtom(atom: LogootAtom): boolean {
        let index = this.findPositionIndex(atom.position);
        if (index > 0) {
            this.replaceAtom(atom);
            index = this.findPositionIndex(atom.position);
            this.atoms[index].delete();

            this.history.push(
                new LogootHistoryEntry([...this.atoms], "delete", atom.toString())
            );
            return true;
        }
        return false;
    }

    replaceAtom(atom: LogootAtom): boolean {
        let index = this.findPositionIndex(atom.position);
        if (index > 0) {
            const newAtom = atom;
            this.atoms.splice(index, 1, newAtom);
            this.history.push(
                new LogootHistoryEntry([...this.atoms], "replace", newAtom.toString())
            );
            return true;
        }
        return false;
    }

    findPositionIndex(pos: Position): number {
        const compareFn = (a: LogootAtom, b: LogootAtom) =>
            a.position.compareOnlyDigits(b.position);
        let low = 0,
            high = this.atoms.length - 1;

        while (low <= high) {
            const mid = (low + high) >> 1;
            const cmp = compareFn(this.atoms[mid], new LogootAtom(pos, ""));
            if (cmp < 0) low = mid + 1;
            else if (cmp > 0) high = mid - 1;
            else return mid;
        }
        return -(low + 1);
    }

    applyInsertOperation(insertOp: InsertOperation): boolean {
        const index = this.findPositionIndex(insertOp.atom.position);
        if (index < 0) {
            this.insertAtom(insertOp.atom);
            return true;
        }
        return this.replaceAtom(insertOp.atom);
    }

    isInsertable(insertOp: InsertOperation): boolean {
        const index = this.findPositionIndex(insertOp.atom.position);
        const insertableAtomVc = insertOp.atom.position.clock;
        if (index < 0) {
            // Если такой позиции нет — вставлять можно только если VectorClock "с нуля"
            return insertableAtomVc.isBegin();
        }
        // Иначе проверяем, что не пропущены предыдущие сообщения
        return !this.atoms[index].position.clock.missedMessageExists(insertableAtomVc);
    }

    isReplaceable(atom: LogootAtom, oldVal: string): boolean {
        const index = this.findPositionIndex(atom.position);
        if (index < 0) {
            console.log(this.siteId, atom.toString(), "not replaceable - not found");
            return false;
        }
        // Можно также проверять совпадение старого значения
        // const replaceableWordMatch = this.atoms[index].value === oldVal;
        const missed = this.atoms[index].position.clock.missedMessageExists(atom.position.clock);
        if (missed) {
            console.log(this.siteId, this.getTextDetailed());
            console.log(this.siteId, atom.toString(), "not replaceable - missed message exists or message is late");
        }
        return !missed; // && replaceableWordMatch;
    }

    isDeletable(atom: LogootAtom): boolean {
        const pos = atom.position;
        const index = this.findPositionIndex(pos);
        if (index < 0) {
            return false;
        }
        if (!atom.isDeleted()) {
            const deletableWordMatch = this.atoms[index].value === atom.value;
            return !this.atoms[index].position.clock.missedMessageExists(pos.clock) && deletableWordMatch;
        } else {
            return !this.atoms[index].position.clock.missedMessageExists(pos.clock);
        }
    }

    size(): number {
        return this.atoms.length;
    }

    getText(): string {
        return this.atoms.filter((a) => !a.isDeleted()).map((a) => a.value).join("");
    }

    getTextDetailed(): string {
        return this.atoms.map((a) => a.toString()).join("   ");
    }
}