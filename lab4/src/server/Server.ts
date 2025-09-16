import { Operation } from "../operations/Operation";
import { InsertOperation } from "../operations/InsertOperation";
import { DeleteOperation } from "../operations/DeleteOperation";
import { ReplaceOperation } from "../operations/ReplaceOperation";
import { LogootDocument } from "../state/LogootDocument";
import { LogootAtom } from "../state/LogootAtom";
import { Position } from "../state/Position";
import { VectorClock } from "../state/VectorClock";

/**
 * Абстрактный Server — синхронизация и stash-логика.
 * Примечание: методы run(), breakIfTermination(), getLogootDoc(), getSiteId(), setTerminated()
 * должны быть реализованы в дочерних классах (InsertionServer, DeletionServer и т.д.).
 */
export abstract class Server {
    public static readonly REPLICAS_CNT = 3;
    public stashedOperations: Operation[] = [];

    abstract run(): Promise<LogootDocument> | LogootDocument;
    abstract breakIfTermination(lastMessages: string[]): Promise<boolean> | boolean;
    abstract getLogootDoc(): LogootDocument;
    abstract getSiteId(): string;
    abstract setTerminated(siteId: string): void;

    /**
     * Популярный цикл: для каждого JSON-сообщения пытаемся десериализовать операцию,
     * пропускаем свои операции, stash'им неподходящие, применяем остальные и пытаемся
     * ре-апплаить stash'енные операции.
     */
    synchronize(lastMessages: string[]) {
        for (const message of lastMessages) {
            if (!message) continue;

            let json: any;
            try {
                json = JSON.parse(message);
            } catch (e) {
                console.warn(this.getSiteId(), "invalid json message:", message);
                continue;
            }

            // termination handling
            if (json.TYPE === "termination") {
                if (json.siteId && json.siteId !== this.getSiteId()) {
                    this.setTerminated(json.siteId);
                }
                continue;
            }

            const operation = this.deserializeOperation(json);
            if (!operation) {
                console.warn(this.getSiteId(), "unknown/unsupported operation JSON:", json);
                continue;
            }

            // не применяем операции, созданные самим собой
            if (operation.getSiteId && operation.getSiteId() === this.getSiteId()) {
                continue;
            }

            if (!operation.isApplicable(this.getLogootDoc())) {
                this.stashOperation(operation);
                continue;
            }

            operation.apply(this.getLogootDoc());

            // попробуем применить stash'енные операции, пока есть изменения
            let stashImpact = true;
            while (stashImpact) {
                const indicesToRemove = this.tryApplyStashedOperations();
                if (indicesToRemove.length === 0) stashImpact = false;
                // удаляем применённые операции из stash (сохраняем порядок остальных)
                this.stashedOperations = this.stashedOperations.filter((_, idx) => !indicesToRemove.includes(idx));
            }
        }
    }

    stashOperation(op: Operation) {
        console.log(this.getSiteId(), "____stashed operation____", op.getType ? op.getType() : op);
        this.stashedOperations.push(op);
    }

    getOpStashSize(): number {
        return this.stashedOperations.length;
    }

    tryApplyStashedOperations(): number[] {
        const successful: number[] = [];
        for (let i = 0; i < this.stashedOperations.length; i++) {
            const op = this.stashedOperations[i];
            const ok = op.isApplicable(this.getLogootDoc());
            console.log(this.getSiteId(), "is it applicable from stash?", ok, "-", op.getType ? op.getType() : op);
            if (ok) {
                const res = op.apply(this.getLogootDoc());
                if (!res) {
                    console.error(this.getSiteId(), "ERROR!!! stashed operation failed:", op.getType ? op.getType() : op);
                }
                successful.push(i);
            }
        }
        return successful;
    }

    /** -------------------- Вспомогательные методы десериализации -------------------- */

    private deserializeOperation(json: any): Operation | null {
        const type = json.TYPE;
        if (type === "insert") {
            const atom = this.reconstructAtom(json.atom);
            return new InsertOperation(atom, json.siteId);
        }
        if (type === "delete") {
            const atom = this.reconstructAtom(json.atom);
            return new DeleteOperation(atom, json.siteId);
        }
        if (type === "replace") {
            const atom = this.reconstructAtom(json.atom);
            // ReplaceOperation(oldVal: string, atom, siteId) — у тебя в Java конструктор был (atom, oldVal, siteId)
            // В TS у меня примерный конструктор: new ReplaceOperation(atom, oldVal, siteId)
            return new ReplaceOperation(atom, json.oldVal ?? json.oldValue ?? json.old, json.siteId);
        }
        return null;
    }

    private reconstructAtom(a: any): LogootAtom {
        // ожидается структура:
        // { position: { digits: number[], siteId: string, clock: { ... } }, value: string, _isDeleted?: boolean }
        const pos = this.reconstructPosition(a.position);
        const value = a.value ?? a.val ?? "";
        const isDeleted = !!(a._isDeleted || a.isDeleted || a.deleted);
        return new LogootAtom(pos, value, isDeleted);
    }

    private reconstructPosition(p: any): Position {
        // ожидается p.digits: number[], p.siteId: string, p.clock: object
        const digits: number[] = Array.isArray(p.digits) ? p.digits : [];
        const siteId: string = p.siteId ?? p.site ?? "";
        const clock = this.reconstructVectorClock(p.clock ?? p.timestamp ?? p.vc ?? {});
        return new Position(digits, siteId, clock);
    }

    private reconstructVectorClock(vcObj: any): VectorClock {
        // vcObj может быть как объект { "<siteId>": number, ... } или { clock: { "<siteId>": number, ... } }
        const payload = vcObj?.clock ?? vcObj ?? {};
        const vc = new VectorClock();
        // payload может быть Map-like or object
        if (typeof payload === "object") {
            for (const k of Object.keys(payload)) {
                const v = Number((payload as any)[k]);
                vc.clock.set(k, Number.isNaN(v) ? 0 : v);
            }
        }
        return vc;
    }
}