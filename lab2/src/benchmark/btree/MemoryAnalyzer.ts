import { BTree } from "../../btree/BTree";

type MemoryUsageResult = {
    nodeCount: number;
    memoryBytes: number;
    treeOrder: number;
};

export class MemoryAnalyzer {
    static getBTreeSizeInBytes(tree: any): number {
        if (!tree.root) return 0;
        return this.calculateNodeSize(tree.root);
    }

    private static calculateNodeSize(node: any): number {
        let size = 0;

        // Заголовок объекта BTreeNode (оценка)
        size += 32; // object header + alignment
        size += 4;  // t
        size += 4;  // n
        size += 1;  // leaf
        size += 3;  // alignment padding

        // keys
        size += 16; // массив заголовок
        size += 4 * node.keys.length; // int32

        // children
        size += 16; // массив заголовок
        size += 8 * node.children.length; // ссылки

        if (!node.leaf) {
            for (let i = 0; i <= node.n; i++) {
                if (node.children[i]) {
                    size += this.calculateNodeSize(node.children[i]);
                }
            }
        }

        return size;
    }

    static analyzeMemoryUsage(nodeCounts: number[], treeOrder: number): MemoryUsageResult[] {
        const results: MemoryUsageResult[] = [];
        const rng = () => Math.floor(Math.random() * 1_000_000_000);

        for (const count of nodeCounts) {
            const tree = new BTree(treeOrder);
            for (let i = 0; i < count; i++) {
                tree.insert(rng());
            }

            const memoryUsage = this.getBTreeSizeInBytes(tree);
            results.push({ nodeCount: count, memoryBytes: memoryUsage, treeOrder });
        }

        return results;
    }

    static printMemoryUsageReport(results: MemoryUsageResult[]) {
        if (results.length === 0) return;

        console.log("B-Tree Memory Usage Report");
        console.log(`Order: ${results[0].treeOrder}`);
        console.log("--------------------------------------");
        console.log(`Nodes       | Memory (MB) | Efficiency`);
        console.log("--------------------------------------");

        for (const result of results) {
            const memoryMB = result.memoryBytes / (1024 * 1024);
            const efficiency = result.memoryBytes / (result.nodeCount * 4);
            console.log(
                `${result.nodeCount.toString().padEnd(10)} | ${memoryMB.toFixed(2).padStart(10)} | ${efficiency.toFixed(2).padStart(10)}`
            );
        }
        console.log("--------------------------------------");
    }
}

if (require.main === module) {
    const nodeCounts = [10_000, 20_000, 30_000, 40_000, 50_000];
    const treeOrder = 5;

    const results = MemoryAnalyzer.analyzeMemoryUsage(nodeCounts, treeOrder);
    MemoryAnalyzer.printMemoryUsageReport(results);
}