import { BTree } from "./btree/BTree";
import { KDTree } from "./kdtree/KDTree";

function main() {
    console.log("=== B-Tree Demo ===");
    const btree = new BTree<number>(2);

    // Вставка значений
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 17, 18, 21, 24, 20, 23, 25].forEach(v => btree.insert(v));

    console.log("Дерево после вставки:");
    btree.traverse();

    // Удаление некоторых элементов
    [1, 3, 20, 24, 25, 6, 10, 17, 21, 7, 23].forEach(v => btree.remove(v));

    console.log("\nДерево после удаления:");
    btree.traverse();

    // --- KDTree демо ---
    console.log("\n=== KD-Tree Demo ===");
    const kdtree = new KDTree(2);

    kdtree.insert([2, 3]);
    kdtree.insert([5, 4]);
    kdtree.insert([9, 6]);
    kdtree.insert([4, 7]);
    kdtree.insert([8, 1]);
    kdtree.insert([7, 2]);

    console.log("Размер KDTree (байт):", kdtree.getSizeInBytes());

    const query = [6, 3];
    const nearest = kdtree.nearestNeighbor(query);
    console.log(`Ближайший сосед к точке [${query}]: [${nearest}]`);

    const inRange = kdtree.rangeSearch([3, 2], [7, 6]);
    console.log("Точки в диапазоне [3,2]-[7,6]:");
    inRange.forEach(p => console.log(`[${p}]`));

    const points = [
        [1, 2],
        [3, 4],
        [5, 6],
        [7, 8],
        [9, 10]
    ];
    kdtree.buildTree(points);

    const neighbors = kdtree.findKNearestNeighbors([3.5, 3.6], 5);
    console.log("5 ближайших соседей к [3.5,3.6]:");
    neighbors.forEach(p => console.log(`[${p}]`));
}

main();