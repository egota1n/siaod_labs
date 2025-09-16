import { LogootDocument } from "../state/LogootDocument";
import { LogootRandomWordWriter } from "../state/LogootRandomWordWriter";
import { Position } from "../state/Position";
import { ReplaceOperation } from "./ReplaceOperation";
import { LogootAtom } from "../state/LogootAtom";

export class OperationPaticularPosRandomFabric {
    private logootRandomWordWriter: LogootRandomWordWriter;
    private pos: Position;

    constructor(pos: Position, seed: number) {
        this.pos = pos;
        this.logootRandomWordWriter = new LogootRandomWordWriter(seed);
    }

    nextOperation(doc: LogootDocument, siteId: string): ReplaceOperation | null {
        // Ищем атом в нужной позиции
        const targetAtom = doc.getAtoms().find(atom => atom.position === this.pos);
        if (!targetAtom) return null;

        const newValue = this.logootRandomWordWriter.genRandomWord();
        const newVc = targetAtom.position.clock;
        newVc.increase(siteId);

        const newPos = new Position(targetAtom.position.digits, siteId, newVc);
        const newAtom = new LogootAtom(newPos, newValue);

        return new ReplaceOperation(newAtom, targetAtom.value, siteId);
    }
}