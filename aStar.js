 /** Node
 * This object represents a 2D x,y pair.
 * It also represents a node within the pathfinding algorithm.
 * As a node it may be the start, end or an intermediate step along the path in a pathfinding solution.
 * The algorithm below does not strictly need its nodes to be 2D points such as this.
 *
 * Another object could be used as a node providing it has the following 2 methods:
 * toString() - required to use the node as a key in a map.
 * equals() - required to check if the goal has been reached.
 */
function Node(x, y) {
    if (!(this instanceof Node)) {
        return new Node(x, y);
    }

    this.x = x;
    this.y = y;
}
Node.prototype = {
    // Allows the point to be used as an object property key
    toString: function () {
        return this.x + "," + this.y;
    },

    // Compare this point against another point
    equals: function (point) {
        if (point instanceof Node) {
            return point.x === this.x && point.y === this.y;
        } else {
            return false;
        }
    }
}

/**
 * SimpleModel
 * Used by the pathfinding algorithm to query the space being searched.
 * The model has a set of standard functions which it must reply to accurately for the algorithm
 * to work correctly.
 *
 * You can write your own model to represent more complex spaces. This simple model only models a
 * 2D grid of nodes that are either passable or not. All movement costs are equal and the path may
 * only move between logically adjacent cells in the grid.
 *
 * A model must have the following methods:
 *
 * array{Node} getNeighbours(Node)
 *     This function takes a node argument and returns and array of nodes that are adjacent to it.
 *     Two nodes are adjacent if they can be traversed between in a single step.
 *
 * Number heuristicEstimate(Node a, Node b)
 *     Estimates cost from node A to node B.
 *
 * Number movementCost(Node a, Node b)
 *     the cost to move between the two nodes.
 *
 * @param int[][] - A simple 2D representation of the space. Each value is a node that will be
 *                  considered by the algorithm. 0 indicates the node is impassable.
 *                  Any other value indicates the node is passable.
 */
function SimpleModel(grid) {
     if (!(this instanceof SimpleModel)) {
        return new SimpleModel(grid);
    }
    this.grid = grid;
}
SimpleModel.prototype = {
    /**
     * get the neighbours of the current node
     * In this simple 2D grid model, the neighbours are the surrounding 8 nodes.
     * In more complex examples adjacency could involve moving between Z levels. Or depend
     * on special movement rules like Knights in chess, or an actor leaping over a gap.
     */
    getNeighbours: function (node) {
        var neighbours = [];
        for (var y = node.y - 1; y <= node.y + 1; y++) {
            for (var x = node.x - 1; x <= node.x + 1; x++) {
                if (y === node.y && x === node.x) {
                    continue;
                }

                if (y >= 0 && x >= 0 && y < this.grid.length && x < this.grid[y].length && this.grid[y][x] > 0) {
                    neighbours.push(new Node(x, y));
                }
            }
        }
        return neighbours;
    },

    /**
     * The heuristic is a function that estimates how far a given node is away from another (such as the goal).
     * The pathfinding algorithm will use this heuristic to choose the most likely node when deciding its next step.
     * Simple heuristics are fast but may make the algorithm spend longer checking dead ends, where as more accurate
     * heuristics will be slower. Often simple is better in most cases.
     * This simple example sums the x and y displacement of the two nodes.
     */
    heuristicEstimate: function (node, targetNode) {
        return Math.abs(node.x - targetNode.x) + Math.abs(node.y - targetNode.y);
    },
    /**
     * Calculates the cost of moving (in a single step) between two nodes.
     * The nodes are assumed to be adjacent. The pathfinding algorithm will use this to
     * build up a running total of the cost of its path as it searches.
     * In this simple example movement along an axis costs 1, and diagonal movement costs 1.4 (root 2 ish)
     */
    movementCost: function (nodeA, nodeB) {
        if (nodeA.x !== nodeB.x && nodeA.y !== nodeB.y) {
            return 1.4;
        } else {
            return 1;
        }
    }
};

/**
 * This is the AStar algorithm
 * Its pretty spiffy, but requires a model object to tell it about the space being searched.
 * It also requires starting and ending nodes, the same used by the model to represent occupiable
 * space.
 *
 * @returns - An array of nodes describing the path found. Or FALSE if no path exists.
 */
function aStar(model, start, end) {
    // As the algorithm first encounters every node it will store the current cost to the node
    // from the starting point.
    // These costs are used when deciding which node to visit next.
    var g_score = {};
    g_score[start] = 0;

    // The estimated cost from the start, to the goal via the given point.
    var f_score = {};
    f_score[start] = model.heuristicEstimate(start, end);

    // This object maps nodes in the path to the previous node that leads to it.
    // The map functions the same as a tree, with a every node having a parent.
    // This means when the goal node has been reached we can recursively lookup the previous
    // node in the path using this map, and retrace the path from the goal to the start.
    var backtrack_map = {};
    var closed = {};
    var open = {};
    open[start] = start;

    while (Object.keys(open).length) {
        // Find the node with the lowest cost
        var lowest_cost = Infinity;
        var node;
        for (var k in open) {
            var cost = f_score[k];
            if (cost < lowest_cost) {
                lowest_cost = cost;
                node = open[k];
            }
        }

        // Check if the goal has been reached...
        // If so use the backtrack map to find our way back to the starting node
        // and return the path.
        if (node.equals(end)) {
            var path = [node];
            do {
                node = backtrack_map[node];
            } while (node && path.unshift(node));
            return path;
        }

        // Remove the node from the open list and put it into the closed list
        delete open[node];
        closed[node] = node;

        // Check each neighbour
        var neighbours = model.getNeighbours(node);
        for (var i = 0, neighbour; neighbour = neighbours[i]; i++) {
            if (neighbour in closed) { // ignore closed nodes
                continue;
            }

            // calculate the path cost to this neighbour along our current path.
            var tentative_g_score = g_score[node] + model.movementCost(node, neighbour);

            // If the neighbour is previously unseen or the cost to this neighbour is lower
            // than its previously calculated cost.
            // Put the current node into the backtrack map as the way back from the neighbour.
            // And make a heuristicEstimate estimate for this neighbour.
            if (!(neighbour in open) || tentative_g_score < g_score[neighbour]) {
                backtrack_map[neighbour] = node;
                g_score[neighbour] = tentative_g_score;
                f_score[neighbour] = tentative_g_score + model.heuristicEstimate(neighbour, end);
                if (!(neighbour in open)) {
                    open[neighbour] = neighbour;
                }
            }
        }
    }

    // every open node has been visited and their neighbours assessed.
    // Nothing left to check so return false.
    return false;
}