import { KDTree } from "../../kdtree/KDTree";
import * as fs from "fs";
import * as path from "path";

class Blackhole {
    consume(obj: any) {
        if (!obj) throw new Error("Blackhole consumed nothing!");
    }
}

class BenchmarkState {
    kdTree!: KDTree;
    allPoints: InstanceType<typeof KDTree.DataPoint>[] = [];
    testPoint: number[] = [];
    randomSeed: number = 42;

    private random() {
        this.randomSeed = (this.randomSeed * 16807) % 2147483647;
        return this.randomSeed / 2147483647;
    }

    async setup(csvFilePath: string) {
        const lines = fs.readFileSync(path.resolve(csvFilePath), "utf-8").split("\n");
        this.allPoints = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const parts = line.split(",");
            const label = parts[0];
            const features = parts.slice(1, 10).map((v) => parseFloat(v));
            this.allPoints.push(new KDTree.DataPoint(features, label));
        }

        this.kdTree = new KDTree(9);
        this.kdTree.buildTreeDataPoints(this.allPoints);

        this.testPoint = Array.from({ length: 9 }, () => this.random() * 255);
    }
}

async function main() {
    const csvPath = "./data.csv";
    const state = new BenchmarkState();
    await state.setup(csvPath);

    const blackhole = new Blackhole();

    // Build Tree Benchmark
    const buildTimes: number[] = [];
    for (let i = 0; i < 5; i++) {
        const start = process.hrtime.bigint();
        const tempTree = new KDTree(9);
        tempTree.buildTreeDataPoints(state.allPoints);
        blackhole.consume(tempTree);
        const end = process.hrtime.bigint();
        buildTimes.push(Number(end - start) / 1000);
    }
    const avgBuild = buildTimes.reduce((a, b) => a + b, 0) / buildTimes.length;
    console.log(`Average Build Time: ${avgBuild.toFixed(2)} μs`);

    // KNN Search Benchmark
    const knnTimes: number[] = [];
    for (let i = 0; i < 5; i++) {
        const start = process.hrtime.bigint();
        const neighbors = state.kdTree.findKNearestNeighbors(state.testPoint, 5);
        blackhole.consume(neighbors);
        const end = process.hrtime.bigint();
        knnTimes.push(Number(end - start) / 1000);
    }
    const avgKnn = knnTimes.reduce((a, b) => a + b, 0) / knnTimes.length;
    console.log(`Average KNN Search Time: ${avgKnn.toFixed(2)} μs`);
}

if (require.main === module) {
    main().catch(console.error);
}