export class KDTree {
    private root: KDNode | null = null;
    private readonly k: number;

    constructor(k: number) {
        if (k <= 0) throw new Error("Dimension k must be > 0");
        this.k = k;
    }

    private createNode(point: number[]): KDNode {
        return { point: [...point], left: null, right: null };
    }

    public static DataPoint = class {
        readonly coordinates: number[];
        readonly label?: string;

        constructor(coordinates: number[], label?: string) {
            if (!coordinates || coordinates.length === 0) {
                throw new Error("Coordinates cannot be null or empty");
            }
            this.coordinates = [...coordinates];
            this.label = label;
        }

        getCoordinate(index: number): number {
            if (index < 0 || index >= this.coordinates.length) {
                throw new RangeError(
                    `Index ${index} out of bounds for length ${this.coordinates.length}`
                );
            }
            return this.coordinates[index];
        }

        toArray(): number[] {
            return [...this.coordinates];
        }
    };

    buildTree(points: number[][]): void {
        if (!points || points.length === 0) {
            throw new Error("Points list cannot be null or empty");
        }

        const dataPoints = points.map(p => new KDTree.DataPoint(p));
        this.buildTreeDataPoints(dataPoints);
    }

    buildTreeDataPoints(points: InstanceType<typeof KDTree.DataPoint>[]): void {
        if (!points || points.length === 0) {
            throw new Error("Points list cannot be null or empty");
        }
        this.root = this.buildTreeRecursive([...points], 0);
    }

    private buildTreeRecursive(points: InstanceType<typeof KDTree.DataPoint>[], depth: number): KDNode | null {
        if (points.length === 0) return null;

        const axis = depth % this.k;
        points.sort((a, b) => a.getCoordinate(axis) - b.getCoordinate(axis));

        const medianIndex = Math.floor(points.length / 2);
        const medianPoint = points[medianIndex];

        const node = this.createNode(medianPoint.toArray());
        node.left = this.buildTreeRecursive(points.slice(0, medianIndex), depth + 1);
        node.right = this.buildTreeRecursive(points.slice(medianIndex + 1), depth + 1);

        return node;
    }

    insert(point: number[]): void {
        if (point.length !== this.k) {
            throw new Error(`Point dimension must be ${this.k}`);
        }
        this.root = this.insertRec(this.root, point, 0);
    }

    private insertRec(node: KDNode | null, point: number[], depth: number): KDNode {
        if (!node) return this.createNode(point);

        const axis = depth % this.k;
        if (point[axis] < node.point[axis]) {
            node.left = this.insertRec(node.left, point, depth + 1);
        } else {
            node.right = this.insertRec(node.right, point, depth + 1);
        }

        return node;
    }

    nearestNeighbor(target: number[]): number[] | null {
        if (!this.root) return null;
        return this.nearestNeighborRec(this.root, target, 0, this.root.point);
    }

    private nearestNeighborRec(node: KDNode | null, target: number[], depth: number, best: number[]): number[] {
        if (!node) return best;

        let bestDist = this.distance(target, best);
        const currentDist = this.distance(target, node.point);

        if (currentDist < bestDist) {
            best = node.point;
        }

        const axis = depth % this.k;
        const goodSide = target[axis] < node.point[axis] ? node.left : node.right;
        const badSide = target[axis] < node.point[axis] ? node.right : node.left;

        best = this.nearestNeighborRec(goodSide, target, depth + 1, best);

        if (Math.abs(node.point[axis] - target[axis]) < this.distance(target, best)) {
            best = this.nearestNeighborRec(badSide, target, depth + 1, best);
        }

        return best;
    }

    rangeSearch(low: number[], high: number[]): number[][] {
        const result: number[][] = [];
        this.rangeSearchRec(this.root, low, high, 0, result);
        return result;
    }

    private rangeSearchRec(node: KDNode | null, low: number[], high: number[], depth: number, result: number[][]): void {
        if (!node) return;

        let inside = true;
        for (let i = 0; i < this.k; i++) {
            if (node.point[i] < low[i] || node.point[i] > high[i]) {
                inside = false;
                break;
            }
        }

        if (inside) result.push([...node.point]);

        const axis = depth % this.k;
        if (low[axis] <= node.point[axis]) {
            this.rangeSearchRec(node.left, low, high, depth + 1, result);
        }
        if (high[axis] >= node.point[axis]) {
            this.rangeSearchRec(node.right, low, high, depth + 1, result);
        }
    }

    findKNearestNeighbors(target: number[], k: number): number[][] {
        if (!this.root || k <= 0 || target.length !== this.k) return [];

        const neighbors: number[][] = [];
        this.findKNearestRec(this.root, target, 0, neighbors, k);
        return neighbors;
    }

    private findKNearestRec(node: KDNode | null, target: number[], depth: number, neighbors: number[][], k: number): void {
        if (!node) return;

        const dist = this.distance(target, node.point);

        if (neighbors.length < k) {
            neighbors.push([...node.point]);
            neighbors.sort((a, b) => this.distance(target, a) - this.distance(target, b));
        } else if (dist < this.distance(target, neighbors[neighbors.length - 1])) {
            neighbors.pop();
            neighbors.push([...node.point]);
            neighbors.sort((a, b) => this.distance(target, a) - this.distance(target, b));
        }

        const axis = depth % this.k;
        const goodSide = target[axis] < node.point[axis] ? node.left : node.right;
        const badSide = target[axis] < node.point[axis] ? node.right : node.left;

        this.findKNearestRec(goodSide, target, depth + 1, neighbors, k);

        if (
            neighbors.length < k ||
            Math.abs(node.point[axis] - target[axis]) <
            this.distance(target, neighbors[neighbors.length - 1])
        ) {
            this.findKNearestRec(badSide, target, depth + 1, neighbors, k);
        }
    }

    public distance(a: number[], b: number[]): number {
        return Math.sqrt(a.reduce((sum, ai, i) => sum + Math.pow(ai - b[i], 2), 0));
    }

    getSizeInBytes(): number {
        return this.getNodeSizeInBytes(this.root);
    }

    private getNodeSizeInBytes(node: KDNode | null): number {
        if (!node) return 0;

        let size = 0;
        size += 12 + 8 * node.point.length;
        size += 2 * 8;
        size += 16;
        size += this.getNodeSizeInBytes(node.left);
        size += this.getNodeSizeInBytes(node.right);
        return size;
    }
}

type KDNode = {
    point: number[];
    left: KDNode | null;
    right: KDNode | null;
};