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

    // g_score: lowest known cost from the start to a given node...
    // This object maps each node against the cost of the best known path to that node.
    // A node's best known cost may change if a shorter path is later found to it.
    var g_score = {};
    g_score[start] = 0;

    // f_score: estimation of the path cost from start to end via a given node...
    // This object maps each node against an estimation of the total cost of the path if the node
    // is included. As the algorithm runs, f_score will determine which node is searched next.
    var f_score = {};
    f_score[start] = model.heuristicEstimate(start, end);

    // backtrack_map: maps nodes to the node they are reachable from.
    // When a new node is found, or a shorter path to a node is found, the node that it was reachable
    // from is stored here. This creates a tree, where the root is the start node and every child node
    // has a single parent.
    // When the goal is found, this tree can traced backwards to give us the final path.
    var backtrack_map = {};

    // The open set contains all the nodes which are known to be pathable to. When checking a node's
    // neighbours, new ones will be added to the open set. Only nodes in the open set are considered
    // when choosing the next node to visit.
    var open = {};
    open[start] = start;

    // Visited nodes are place in the closed set so they cannot be visited again. And can be ignored
    // when calculating the costs of a node's neighbours.
    var closed = {};

    // The main loop of the algorithm
    while (Object.keys(open).length) {

        // First choose the node with the lowest estimated cost from the open set
        var lowest_cost = Infinity;
        var node;
        for (var k in open) {
            var cost = f_score[k];
            if (cost < lowest_cost) {
                lowest_cost = cost;
                node = open[k];
            }
        }

        // Check if this node is the goal
        // If so use the backtrack map to find our way back to the starting node
        // and return the path.
        if (node.equals(end)) {
            var path = [node];
            do {
                node = backtrack_map[node];
            } while (node && path.unshift(node));
            return path;
        }

        // Remove the node from the open set and put it into the closed set
        delete open[node];
        closed[node] = node;

        // Check the node's neighbours and estimate their cost to reach the goal
        var neighbours = model.getNeighbours(node);
        for (var i = 0, neighbour, g_score_node = g_score[node]; neighbour = neighbours[i]; i++) {
            if (neighbour in closed) { // ignore closed nodes
                continue;
            }
            // slight optimisation
            var neighbour_ = neighbour.toString();

            // calculate the path cost to this neighbour along our current path.
            var tentative_g_score = g_score_node + model.movementCost(node, neighbour);

            // If the neighbour is previously unseen or the cost to this neighbour is lower
            // than its previously calculated cost.
            // Put the current node into the backtrack map as the way back from the neighbour.
            // And make a heuristicEstimate estimate for this neighbour.
            if (!(neighbour in open) || tentative_g_score < g_score[neighbour_]) {
                backtrack_map[neighbour_] = node;
                g_score[neighbour_] = tentative_g_score;
                f_score[neighbour_] = tentative_g_score + model.heuristicEstimate(neighbour, end);
                if (!(neighbour in open)) {
                    open[neighbour_] = neighbour;
                }
            }
        }
    }

    // every open node has been visited and their neighbours assessed.
    // Nothing left to check so return false.
    return false;
}