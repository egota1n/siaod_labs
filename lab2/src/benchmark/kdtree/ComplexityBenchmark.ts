import { KDTree } from "../../kdtree/KDTree";

class Blackhole {
    consume(obj: any) {
        if (!obj) throw new Error("Blackhole consumed nothing!");
    }
}

class ComplexityBenchmarkState {
    size: number;
    kdTree!: KDTree;
    points: InstanceType<typeof KDTree.DataPoint>[] = [];
    testPoint: number[] = [];
    randomSeed: number = 42;

    constructor(size: number) {
        this.size = size;
    }

    public random() {
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

        this.kdTree.buildTreeDataPoints(this.points);
        this.testPoint = [50, 50];
    }
}

async function main() {
    const sizes = [100_000, 200_000, 300_000, 400_000, 500_000];
    const blackhole = new Blackhole();

    for (const size of sizes) {
        const state = new ComplexityBenchmarkState(size);
        state.setup();

        console.log(`\n--- Benchmark for size=${size} ---`);

        // Build Tree Complexity
        const buildTimes: number[] = [];
        for (let i = 0; i < 5; i++) {
            const start = process.hrtime.bigint();
            const tempTree = new KDTree(2);
            tempTree.buildTreeDataPoints(state.points);
            blackhole.consume(tempTree);
            const end = process.hrtime.bigint();
            buildTimes.push(Number(end - start) / 1000);
        }
        const avgBuild = buildTimes.reduce((a, b) => a + b, 0) / buildTimes.length;
        console.log(`Average Build Time: ${avgBuild.toFixed(2)} μs`);

        // Nearest Neighbor Complexity
        const nnTimes: number[] = [];
        for (let i = 0; i < 1000; i++) {
            const query = [state.random() * 100, state.random() * 100];
            const start = process.hrtime.bigint();
            blackhole.consume(state.kdTree.nearestNeighbor(query));
            const end = process.hrtime.bigint();
            nnTimes.push(Number(end - start) / 1000);
        }
        const avgNN = nnTimes.reduce((a, b) => a + b, 0) / nnTimes.length;
        console.log(`Average Nearest Neighbor Time: ${avgNN.toFixed(2)} μs`);

        // Range Search Complexity
        const rangeTimes: number[] = [];
        for (let i = 0; i < 100; i++) {
            const x = state.random() * 80;
            const y = state.random() * 80;
            const low = [x, y];
            const high = [x + 20, y + 20];
            const start = process.hrtime.bigint();
            blackhole.consume(state.kdTree.rangeSearch(low, high));
            const end = process.hrtime.bigint();
            rangeTimes.push(Number(end - start) / 1000);
        }
        const avgRange = rangeTimes.reduce((a, b) => a + b, 0) / rangeTimes.length;
        console.log(`Average Range Search Time: ${avgRange.toFixed(2)} μs`);

        // KNN Search Complexity
        const knnTimes: number[] = [];
        for (let i = 0; i < 100; i++) {
            const query = [state.random() * 100, state.random() * 100];
            const start = process.hrtime.bigint();
            blackhole.consume(state.kdTree.findKNearestNeighbors(query, 10));
            const end = process.hrtime.bigint();
            knnTimes.push(Number(end - start) / 1000);
        }
        const avgKNN = knnTimes.reduce((a, b) => a + b, 0) / knnTimes.length;
        console.log(`Average KNN Search Time: ${avgKNN.toFixed(2)} μs`);
    }
}

if (require.main === module) {
    main().catch(console.error);
}