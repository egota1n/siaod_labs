import { KDTree } from "../../kdtree/KDTree";

export class MemoryAnalyzer {
    private dimensions: number;
    private seed: number = 42;

    constructor(dimensions: number) {
        this.dimensions = dimensions;
    }

    private random(): number {
        this.seed = (this.seed * 16807) % 2147483647;
        return this.seed / 2147483647;
    }

    private generateRandomPoints(count: number): InstanceType<typeof KDTree.DataPoint>[] {
        const points: InstanceType<typeof KDTree.DataPoint>[] = [];
        for (let i = 0; i < count; i++) {
            const coords = Array.from({ length: this.dimensions }, () => this.random() * 100);
            points.push(new KDTree.DataPoint(coords));
        }
        return points;
    }

    private buildTree(points: InstanceType<typeof KDTree.DataPoint>[]): KDTree {
        const tree = new KDTree(this.dimensions);
        tree.buildTreeDataPoints(points);
        return tree;
    }

    analyzeMemoryUsage(treeSizes: number[]) {
        for (const size of treeSizes) {
            const points = this.generateRandomPoints(size);
            const tree = this.buildTree(points);
            this.printEfficiencyMemoryUsage(size, tree, points);
        }
    }

    getMemoryUsage(size: number): MemoryUsageResult {
        const points = this.generateRandomPoints(size);
        const tree = this.buildTree(points);
        return new MemoryUsageResult(size, tree.getSizeInBytes());
    }

    private printMemoryUsage(size: number, tree: KDTree) {
        const bytes = tree.getSizeInBytes();
        console.log(`KDTree with ${size.toLocaleString()} nodes (${this.dimensions}D):`);
        console.log(`  Memory used: ${(bytes / (1024 * 1024)).toFixed(2)} MB\n`);
    }

    private printEfficiencyMemoryUsage(
        size: number,
        tree: KDTree,
        points: InstanceType<typeof KDTree.DataPoint>[]
    ) {
        const bytesDataset = points.reduce((sum, p) => sum + p.coordinates.length * 8, 0);
        const bytesTree = tree.getSizeInBytes();

        console.log(`KDTree with ${size.toLocaleString()} nodes (${this.dimensions}D):`);
        console.log(`  Efficiency: ${(bytesDataset / bytesTree).toFixed(4)} bytes`);
        console.log(`  Memory used: ${(bytesTree / (1024 * 1024)).toFixed(2)} MB`);
        console.log(`  Dataset memory used: ${(bytesDataset / (1024 * 1024)).toFixed(2)} MB\n`);
    }
}

export class MemoryUsageResult {
    nodeCount: number;
    memoryBytes: number;

    constructor(nodeCount: number, memoryBytes: number) {
        this.nodeCount = nodeCount;
        this.memoryBytes = memoryBytes;
    }
}

if (require.main === module) {
    const analyzer = new MemoryAnalyzer(2);
    analyzer.analyzeMemoryUsage([10000, 20000, 30000, 40000, 50000]);
}