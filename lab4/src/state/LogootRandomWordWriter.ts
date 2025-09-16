import fs from "fs";
import { randomInt } from "crypto";
import { LogootDocument } from "./LogootDocument";
import { LogootAtom } from "./LogootAtom";
import { Position } from "./Position";
import { VectorClock } from "./VectorClock";
import { InsertOperation } from "../operations/InsertOperation";
import { DeleteOperation } from "../operations/DeleteOperation";
import { ReplaceOperation } from "../operations/ReplaceOperation";

export class LogootRandomWordWriter {
    private wordsDict: string[] = [];
    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
        try {
            const fileData = fs.readFileSync("words.txt", "utf-8");
            this.wordsDict = fileData.split(/\r?\n/).filter(Boolean);
        } catch (e) {
            console.error("Ошибка загрузки words.txt", e);
            this.wordsDict = ["default "]; // fallback
        }
    }

    private randomIndex(max: number): number {
        return Math.abs(randomInt(max));
    }

    genRandomWord(): string {
        if (this.wordsDict.length === 0) return "default ";
        return this.wordsDict[this.randomIndex(this.wordsDict.length)] + " ";
    }

    genRandomInsertOperation(doc: LogootDocument, siteId: string): InsertOperation | null {
        if (doc.size() < 2) return null;

        let rightPosIndex = this.randomIndex(doc.size());
        if (rightPosIndex === 0) rightPosIndex = 1;
        const leftPosIndex = rightPosIndex - 1;

        const randomWord = this.genRandomWord();
        const leftPos = doc.getAtoms()[leftPosIndex].position;
        const rightPos = doc.getAtoms()[rightPosIndex].position;
        const atomPos = doc.generatePositionBetween(leftPos, rightPos);

        return new InsertOperation(new LogootAtom(atomPos, randomWord), siteId);
    }

    genRandomDeleteOperation(doc: LogootDocument, siteId: string): DeleteOperation | null {
        if (doc.size() <= 2) return null;

        let posIndex = this.randomIndex(doc.size());
        while (posIndex === 0 || posIndex === doc.size() - 1) {
            posIndex = this.randomIndex(doc.size());
        }

        const oldAtom = doc.getAtoms()[posIndex];
        const newVc = new VectorClock(oldAtom.position.clock);
        newVc.increase(siteId);
        const newPos = new Position(oldAtom.position.digits, siteId, newVc);
        const newAtom = new LogootAtom(newPos, oldAtom.value);

        return new DeleteOperation(newAtom, siteId);
    }

    genRandomReplaceOperation(doc: LogootDocument, siteId: string): ReplaceOperation | null {
        if (doc.size() <= 2) return null;

        let posIndex = this.randomIndex(doc.size());
        while (posIndex === 0 || posIndex === doc.size() - 1) {
            posIndex = this.randomIndex(doc.size());
        }

        const randomWord = this.genRandomWord();
        const targetAtom = doc.getAtoms()[posIndex];
        const newVc = new VectorClock(targetAtom.position.clock);
        newVc.increase(siteId);
        const newPos = new Position(targetAtom.position.digits, siteId, newVc);
        const newAtom = new LogootAtom(newPos, randomWord);

        return new ReplaceOperation(newAtom, targetAtom.value, siteId);
    }

    genInsertSpecificWordOperation(
        doc: LogootDocument,
        siteId: string,
        word: string
    ): InsertOperation | null {
        if (doc.size() < 2) return null;

        let rightPosIndex = this.randomIndex(doc.size());
        if (rightPosIndex === 0) rightPosIndex = 1;
        const leftPosIndex = rightPosIndex - 1;

        const leftPos = doc.getAtoms()[leftPosIndex].position;
        const rightPos = doc.getAtoms()[rightPosIndex].position;
        const atomPos = doc.generatePositionBetween(leftPos, rightPos);

        return new InsertOperation(new LogootAtom(atomPos, word), siteId);
    }
}