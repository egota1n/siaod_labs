export class BTreeNode<T> {
    static level = 0;
    keys: (T | undefined)[];
    children: (BTreeNode<T> | undefined)[];
    n: number;
    leaf: boolean;
    t: number;

    constructor(t: number, leaf: boolean) {
        this.t = t;
        this.leaf = leaf;
        this.keys = new Array<T | undefined>(2 * t - 1);
        this.children = new Array<BTreeNode<T> | undefined>(2 * t);
        this.n = 0;
    }

    private findKey(k: T): number {
        let idx = 0;
        while (idx < this.n && this.keys[idx]! < k) idx++;
        return idx;
    }

    remove(k: T): void {
        const idx = this.findKey(k);

        if (idx < this.n && this.keys[idx] === k) {
            if (this.leaf)
                this.removeFromLeaf(idx);
            else
                this.removeFromNonLeaf(idx);
        } else {
            if (this.leaf) return;

            const flag = idx === this.n;
            if ((this.children[idx]!.n) < this.t)
                this.fill(idx);

            if (flag && idx > this.n)
                this.children[idx - 1]!.remove(k);
            else
                this.children[idx]!.remove(k);
        }
    }

    private removeFromLeaf(idx: number): void {
        for (let i = idx + 1; i < this.n; ++i)
            this.keys[i - 1] = this.keys[i];
        this.n--;
    }

    private removeFromNonLeaf(idx: number): void {
        const k = this.keys[idx]!;
        if (this.children[idx]!.n >= this.t) {
            const pred = this.getPred(idx);
            this.keys[idx] = pred;
            this.children[idx]!.remove(pred);
        } else if (this.children[idx + 1]!.n >= this.t) {
            const succ = this.getSucc(idx);
            this.keys[idx] = succ;
            this.children[idx + 1]!.remove(succ);
        } else {
            this.merge(idx);
            this.children[idx]!.remove(k);
        }
    }

    private getPred(idx: number): T {
        let cur = this.children[idx]!;
        while (!cur.leaf)
            cur = cur.children[cur.n]!;
        return cur.keys[cur.n - 1]!;
    }

    private getSucc(idx: number): T {
        let cur = this.children[idx + 1]!;
        while (!cur.leaf)
            cur = cur.children[0]!;
        return cur.keys[0]!;
    }

    private fill(idx: number): void {
        if (idx !== 0 && this.children[idx - 1]!.n >= this.t)
            this.borrowFromPrev(idx);
        else if (idx !== this.n && this.children[idx + 1]!.n >= this.t)
            this.borrowFromNext(idx);
        else {
            if (idx !== this.n)
                this.merge(idx);
            else
                this.merge(idx - 1);
        }
    }

    private borrowFromPrev(idx: number): void {
        const child = this.children[idx]!;
        const sibling = this.children[idx - 1]!;

        for (let i = child.n - 1; i >= 0; --i)
            child.keys[i + 1] = child.keys[i];

        if (!child.leaf) {
            for (let i = child.n; i >= 0; --i)
                child.children[i + 1] = child.children[i];
        }

        child.keys[0] = this.keys[idx - 1];
        if (!child.leaf)
            child.children[0] = sibling.children[sibling.n];

        this.keys[idx - 1] = sibling.keys[sibling.n - 1];

        child.n += 1;
        sibling.n -= 1;
    }

    private borrowFromNext(idx: number): void {
        const child = this.children[idx]!;
        const sibling = this.children[idx + 1]!;

        child.keys[child.n] = this.keys[idx];

        if (!child.leaf)
            child.children[child.n + 1] = sibling.children[0];

        this.keys[idx] = sibling.keys[0];

        for (let i = 1; i < sibling.n; ++i)
            sibling.keys[i - 1] = sibling.keys[i];

        if (!sibling.leaf) {
            for (let i = 1; i <= sibling.n; ++i)
                sibling.children[i - 1] = sibling.children[i];
        }

        child.n += 1;
        sibling.n -= 1;
    }

    private merge(idx: number): void {
        const child = this.children[idx]!;
        const sibling = this.children[idx + 1]!;

        child.keys[this.t - 1] = this.keys[idx];

        for (let i = 0; i < sibling.n; ++i)
            child.keys[i + this.t] = sibling.keys[i];

        if (!child.leaf) {
            for (let i = 0; i <= sibling.n; ++i)
                child.children[i + this.t] = sibling.children[i];
        }

        for (let i = idx + 1; i < this.n; ++i)
            this.keys[i - 1] = this.keys[i];

        for (let i = idx + 2; i <= this.n; ++i)
            this.children[i - 1] = this.children[i];

        child.n += sibling.n + 1;
        this.n--;
    }

    insertNonFull(k: T): void {
        let i = this.n - 1;

        if (this.leaf) {
            while (i >= 0 && this.keys[i]! > k) {
                this.keys[i + 1] = this.keys[i];
                i--;
            }
            this.keys[i + 1] = k;
            this.n++;
        } else {
            while (i >= 0 && this.keys[i]! > k) i--;

            if (this.children[i + 1]!.n === 2 * this.t - 1) {
                this.splitChild(i + 1, this.children[i + 1]!);

                if (this.keys[i + 1]! < k) i++;
            }
            this.children[i + 1]!.insertNonFull(k);
        }
    }

    splitChild(i: number, y: BTreeNode<T>) {
        const t = this.t;
        const z = new BTreeNode<T>(t, y.leaf);

        // Копируем ключи в правый узел
        const numKeysRight = y.n - t;
        for (let j = 0; j < numKeysRight; j++) {
            z.keys[j] = y.keys[j + t];
        }
        z.n = numKeysRight;

        // Копируем детей, если есть
        if (!y.leaf) {
            for (let j = 0; j <= numKeysRight; j++) {
                z.children[j] = y.children[j + t];
            }
        }

        // Обновляем левый узел
        y.n = t - 1;

        // Сдвигаем детей родителя и вставляем z
        for (let j = this.n; j >= i + 1; j--) {
            this.children[j + 1] = this.children[j];
        }
        this.children[i + 1] = z;

        // Сдвигаем ключи родителя и вставляем средний ключ
        for (let j = this.n - 1; j >= i; j--) {
            this.keys[j + 1] = this.keys[j];
        }
        this.keys[i] = y.keys[t - 1];
        this.n += 1;
    }

    search(k: T): BTreeNode<T> | null {
        let i = 0;
        while (i < this.n && k > this.keys[i]!) i++;

        if (i < this.n && this.keys[i] === k) return this;
        if (this.leaf) return null;

        return this.children[i]!.search(k);
    }

    traverse(): void {
        console.log("  ".repeat(BTreeNode.level) + "[" + this.keys.slice(0, this.n).join(", ") + "]");
        if (!this.leaf) {
            BTreeNode.level++;
            for (let i = 0; i <= this.n; i++) {
                this.children[i]!.traverse();
            }
            BTreeNode.level--;
        }
    }
}