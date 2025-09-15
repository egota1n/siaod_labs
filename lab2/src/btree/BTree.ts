import { BTreeNode } from "./BTreeNode";

export class BTree<T> {
    public root: BTreeNode<T> | null;
    private t: number;

    constructor(t: number) {
        this.root = null;
        this.t = t;
    }

    search(k: T): BTreeNode<T> | null {
        return this.root ? this.root.search(k) : null;
    }

    insert(k: T): void {
        if (this.root === null) {
            this.root = new BTreeNode<T>(this.t, true);
            this.root.keys[0] = k;
            this.root.n = 1;
        } else {
            if (this.root.n === 2 * this.t - 1) {
                const s = new BTreeNode<T>(this.t, false);
                s.children[0] = this.root;
                s.splitChild(0, this.root);

                let i = 0;
                if (s.keys[0]! < k) i++;
                s!.children[i]!.insertNonFull(k);

                this.root = s;
            } else {
                this.root.insertNonFull(k);
            }
        }
    }

    remove(k: T): void {
        if (!this.root) return;
        this.root.remove(k);

        if (this.root.n === 0) {
            if (this.root.leaf)
                this.root = null;
            else
                this.root = this.root.children[0] ?? null;
        }
    }

    traverse(): void {
        if (this.root) {
            BTreeNode.level = 0;
            this.root.traverse();
        } else {
            console.log("Дерево пустое");
        }
    }
}