import { BTree } from "../../btree/BTree";

function randomInt(max: number): number {
    return Math.floor(Math.random() * max);
}

function benchmark(fn: () => void, iterations: number = 5): number[] {
    const times: number[] = [];
    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        fn();
        const end = performance.now();
        times.push(end - start);
    }
    return times;
}

function printStats(name: string, times: number[]) {
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    console.log(`${name} -> Avg: ${avg.toFixed(3)} ms | Min: ${Math.min(...times).toFixed(3)} | Max: ${Math.max(...times).toFixed(3)}`);
}

const sizes = [100_000, 200_000, 300_000, 400_000, 500_000];
const iterationsPerTest = 5;

for (const size of sizes) {
    console.log(`\n=== B-Tree Benchmark, size=${size} ===`);

    // Генерация тестовых данных
    const testData: number[] = [];
    const rng = () => randomInt(size * 2);
    for (let i = 0; i < size; i++) {
        testData.push(rng());
    }

    // Построение дерева заранее
    const btree = new BTree(3);
    for (const key of testData) {
        btree.insert(key);
    }

    // Insert Benchmark
    const insertTimes = benchmark(() => {
        const tempTree = new BTree(3);
        for (const key of testData) {
            tempTree.insert(key);
        }
    }, iterationsPerTest);
    printStats("Insert", insertTimes);

    // Search Benchmark
    const searchTimes = benchmark(() => {
        for (let i = 0; i < 1000; i++) {
            const key = testData[randomInt(testData.length)];
            btree.search(key);
        }
    }, iterationsPerTest);
    printStats("Search", searchTimes);

    // Delete Benchmark
    const deleteTimes = benchmark(() => {
        const tempTree = new BTree(3);
        for (const key of testData) tempTree.insert(key);
        for (let i = 0; i < Math.floor(size / 10); i++) {
            const key = testData[randomInt(testData.length)];
            tempTree.remove(key);
        }
    }, iterationsPerTest);
    printStats("Delete", deleteTimes);
}