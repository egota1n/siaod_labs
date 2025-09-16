import { KDTree } from "../../kdtree/KDTree";

class Blackhole {
    consume(_obj: any) {
        if (!_obj) throw new Error("Blackhole consumed nothing!");
    }
}

export class MemoryBenchmark {
    size: number;
    kdTree!: KDTree;
    points!: InstanceType<typeof KDTree.DataPoint>[];
    randomSeed: number = 42;

    constructor(size: number) {
        this.size = size;
    }

    private random(): number {
        this.randomSeed = (this.randomSeed * 16807) % 2147483647;
        return this.randomSeed / 2147483647;
    }

    setup() {
        this.kdTree = new KDTree(2);
        this.points = [];
        for (let i = 0; i < this.size; i++) {
            const x = this.random() * 100;
            const y = this.random() * 100;
            this.points.push(new KDTree.DataPoint([x, y]));
        }
    }

    memoryUsageBenchmark(blackhole: Blackhole) {
        const tempTree = new KDTree(2);
        tempTree.buildTreeDataPoints(this.points);
        blackhole.consume(tempTree);
    }
}

if (require.main === module) {
    const sizes = [1000, 2000, 3000, 4000, 5000];
    const blackhole = new Blackhole();

    for (const size of sizes) {
        const benchmark = new MemoryBenchmark(size);
        benchmark.setup();

        console.log(`Running memory benchmark for size = ${size}`);
        const start = performance.now();
        benchmark.memoryUsageBenchmark(blackhole);
        const end = performance.now();
        console.log(`Elapsed time: ${(end - start).toFixed(2)} ms\n`);
    }
}