import { BTree } from "../../btree/BTree";

class BenchmarkState {
    btree!: BTree<number>;
    testData!: number[];
    random!: () => number;

    setup() {
        const order = 3;
        this.btree = new BTree<number>(order);

        let seed = 42;
        this.random = () => {
            seed = (seed * 16807) % 2147483647;
            return seed / 2147483647;
        };

        this.testData = [];
        for (let i = 0; i < 50_000; i++) {
            this.testData.push(Math.floor(this.random() * 100_000));
        }
    }
}

function measureTime(label: string, fn: () => void) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${label}: ${(end - start).toFixed(3)} ms`);
}

function insertBenchmark(state: BenchmarkState) {
    const tempTree = new BTree<number>(3);
    for (const key of state.testData) {
        tempTree.insert(key);
    }
}

function searchBenchmark(state: BenchmarkState) {
    for (let i = 0; i < 1000; i++) {
        const key = state.testData[Math.floor(state.random() * state.testData.length)];
        state.btree.search(key);
    }
}

function deleteBenchmark(state: BenchmarkState) {
    const tempTree = new BTree<number>(3);
    for (const key of state.testData) {
        tempTree.insert(key);
    }
    for (let i = 0; i < 1000; i++) {
        const key = state.testData[Math.floor(state.random() * state.testData.length)];
        tempTree.remove(key);
    }
}

function main() {
    const state = new BenchmarkState();
    state.setup();

    console.log("=== B-Tree Benchmark ===");

    measureTime("Insert Benchmark", () => insertBenchmark(state));
    measureTime("Search Benchmark", () => searchBenchmark(state));
    measureTime("Delete Benchmark", () => deleteBenchmark(state));
}

main();