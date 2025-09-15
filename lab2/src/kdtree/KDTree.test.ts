import { KDTree } from './KDTree';

describe('KDTree', () => {
    let kdTree: KDTree;
    const dimensions = 2;

    beforeEach(() => {
        kdTree = new KDTree(dimensions);
    });

    test('empty tree', () => {
        expect(kdTree.nearestNeighbor([1, 2])).toBeNull();
        expect(kdTree.rangeSearch([0, 0], [10, 10])).toHaveLength(0);
    });

    test('insert and search', () => {
        const point1 = [2, 3];
        const point2 = [5, 4];

        kdTree.insert(point1);
        kdTree.insert(point2);

        expect(kdTree.nearestNeighbor([2, 3])).toEqual(point1);
        expect(kdTree.nearestNeighbor([5, 4])).toEqual(point2);
    });

    test('build tree from points', () => {
        const points = [
            [1, 2],
            [3, 4],
            [5, 6],
        ];

        kdTree.buildTree(points);

        expect(kdTree.nearestNeighbor([3, 3])).toEqual([3, 4]);
    });

    test('range search', () => {
        const points = [
            [1, 1],
            [2, 2],
            [3, 3],
            [4, 4],
        ];
        kdTree.buildTree(points);

        const result = kdTree.rangeSearch([1.5, 1.5], [3.5, 3.5]);
        expect(result).toHaveLength(2);
        expect(result).toEqual(
            expect.arrayContaining([
                [2, 2],
                [3, 3],
            ])
        );
    });

    test('k nearest neighbors', () => {
        const points = [
            [1, 1],
            [2, 2],
            [3, 3],
            [4, 4],
        ];
        kdTree.buildTree(points);

        const neighbors = kdTree.findKNearestNeighbors([2.5, 2.5], 2);
        expect(neighbors).toHaveLength(2);
        expect(neighbors).toEqual(
            expect.arrayContaining([
                [2, 2],
                [3, 3],
            ])
        );
    });

    test('build tree from DataPoints', () => {
        const points: any = [
            new KDTree.DataPoint([1, 2]),
            new KDTree.DataPoint([3, 4]),
            new KDTree.DataPoint([5, 6]),
        ];

        kdTree.buildTreeDataPoints(points);

        expect(kdTree.nearestNeighbor([3, 3])).toEqual([3, 4]);
    });

    test('invalid point dimensions', () => {
        expect(() => kdTree.insert([1])).toThrow();
    });

    test('DataPoint methods', () => {
        const point = new KDTree.DataPoint([1, 2], 'test');

        expect(point.getCoordinate(0)).toBe(1);
        expect(point.getCoordinate(1)).toBe(2);
        expect(point.toArray()).toEqual([1, 2]);
        expect(point.label).toBe('test');
    });

    test('distance calculation', () => {
        const dist = kdTree.distance([0, 0], [3, 4]);
        expect(dist).toBeCloseTo(5.0, 4);
    });
});