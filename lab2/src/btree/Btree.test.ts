import { BTree } from './BTree';
import { BTreeNode } from './BTreeNode';

describe('BTree', () => {
    let btree: BTree<number>;

    beforeEach(() => {
        btree = new BTree(2);
    });

    test('insert and search', () => {
        btree.insert(10);
        btree.insert(20);
        btree.insert(30);

        expect(btree.search(10)).not.toBeNull();
        expect(btree.search(20)).not.toBeNull();
        expect(btree.search(30)).not.toBeNull();
    });

    test('remove', () => {
        btree.insert(10);
        btree.insert(20);
        btree.insert(30);

        btree.remove(20);

        expect(btree.search(20)).toBeNull();
        expect(btree.search(10)).not.toBeNull();
        expect(btree.search(30)).not.toBeNull();
    });

    test('traverse', () => {
        btree.insert(10);
        btree.insert(20);
        btree.insert(30);

        btree.traverse();
    });

    test('empty tree', () => {
        expect(btree.search(10)).toBeNull();
        btree.traverse();
    });

    test('insertNonFull', () => {
        const node = new BTreeNode(2, true);
        node.insertNonFull(10);
        node.insertNonFull(20);

        expect(node.n).toBe(2);
        expect(node.keys[0]).toBe(10);
        expect(node.keys[1]).toBe(20);
    });

    it('testSplitChild', () => {
        const node = new BTreeNode<number>(2, false);
        const child = new BTreeNode<number>(2, true);
        child.keys[0] = 10;
        child.keys[1] = 20;
        child.n = 2;

        node.children[0] = child;
        node.splitChild(0, child);

        expect(node.n).toBe(1);
        expect(node.keys[0]).toBe(20)

        const leftChild = node.children[0];
        expect(leftChild).toBeDefined();
        if (leftChild) {
            expect(leftChild.n).toBe(1);
            expect(leftChild.keys[0]).toBe(10);
        }

        const rightChild = node.children[1];
        expect(rightChild).toBeDefined();
        if (rightChild) {
            expect(rightChild.n).toBe(0);
        }
    });
});