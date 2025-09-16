import { BTree } from "../../btree/BTree";

class Blackhole {
    consume(obj: any) {
        if (!obj) throw new Error("Blackhole consumed nothing!");
    }
}

export class MemoryBenchmark {
    size: number;
    btree!: BTree<any>;
    testData: number[] = [];
    random!: () => number;

    constructor(size: number) {
        this.size = size;
    }

    setup() {
        this.btree = new BTree(3);
        let seed = 42;
        this.random = () => {
            seed = (seed * 16807) % 2147483647;
            return seed % (this.size * 2);
        };
        this.testData = [];
        for (let i = 0; i < this.size; i++) {
            this.testData.push(this.random());
        }
    }

    memoryUsageBenchmark(blackhole: Blackhole) {
        const tempTree = new BTree(3);
        for (const key of this.testData) {
            tempTree.insert(key);
        }
        blackhole.consume(tempTree);
    }
}

if (require.main === module) {
    const sizes = [1000, 2000, 3000, 4000];
    const blackhole = new Blackhole();

    for (const size of sizes) {
        const benchmark = new MemoryBenchmark(size);
        benchmark.setup();

        // Измеряем среднее время выполнения
        const iterations = 3;
        const times: number[] = [];
        for (let i = 0; i < iterations; i++) {
            const start = process.hrtime.bigint();
            benchmark.memoryUsageBenchmark(blackhole);
            const end = process.hrtime.bigint();
            const durationUs = Number(end - start) / 1000;
            times.push(durationUs);
        }

        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        console.log(`Size: ${size}, Avg Time: ${avgTime.toFixed(2)} μs`);
    }
}