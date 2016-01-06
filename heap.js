/**
 * Construct a new MinBinaryHeap()
 */
function MinBinaryHeap(values, elements) {
    if (!this instanceof MinBinaryHeap) {
        return new MinBinaryHeap(values, elements);
    }

    this.v = [];
    this.e = [];

    if (values instanceof Array) {
        this.v = values.slice(0);
    }
    if (elements instanceof Array) {
        this.e = elements.slice(0);
    }

    if (this.e.length < this.v.length) {
        throw "Error: cannot construct a heap with more elements than values.";
    }

    this.length = this.v.length;
    return this;
}

MinBinaryHeap.prototype = {

    /**
     * Double the size of the underlying arrays
     */
    grow: function () {
        if (this.v.length === 0) {
            this.v.length = 1;
        } else {
            this.v.length = this.v.length * 2;
        }

        this.e.length = this.v.length;
        return this;
    },

    /**
     * Halve the size of the underlying arrays
     */
    shrink: function () {
        this.v.length = Math.floor(this.v.length / 2);
        this.e.length = this.v.length;
        return this;
    },

    /**
     * Adds the element to the end of the heap then bubbles it upwards until it is in a sorted
     * position.
     * @param  {int} value   the sorting value of the element
     * @param  {any} element the element to store in the heap
     */
    push: function (value, element) {
        if (this.length >= this.v.length) {
            this.grow(); // The arrays are full, need to grow the heap
        }

        // Add the element to the end of the heap
        this.v[this.length] = value;
        this.e[this.length] = element;

        // Bubble up the value until it is sorted
        // The loop will terminate if the value becomes the root or cannot be swapped with its
        // parent.
        this.bubble(this.length);

        this.length++;
        return this;
    },

    /**
     * removes the top node from the heap and returns it. The heap will be re-sorted afterwards.
     */
    pop: function () {
        // Return undefined if the heap is currently empty (could alternatively throw an exception)
        if (this.length === 0) {
            return;
        }

        // decrease the end pointer (now pointing at last element)
        // then check if the underlying arrays can be shrunk
        this.length--;
        if (this.length < this.v.length) {
            this.shrink();
        }

        var element = this.e[0];
        if (this.length === 0) {
            // the heap only contains 1 element, so simply return it
            return element;
        }

        // Move the last element to the root
        this.v[0] = this.v[this.length];
        this.e[0] = this.e[this.length];

        // Sink the root until it falls to a sorted position
        this.sink(0);

        return element;
    },

    /**
     * Updates the value of an existing node in the heap.
     * Depending on weather the new node is smaller or greater than before the node will
     * bubble up or down until the heap is sorted again.
     *
     * @param {int} index - the position of the element to update
     * @param {int} newValue - The new sorting value of the element
     */
    update: function (index, newValue) {
        if (this.v[index] < newValue) {
            // Sink Down
            this.v[index] = value;
            this.sink(index);
        } else {
            // Bubble Up
            this.v[index] = value;
            this.bubble(index);
        }

        return this;
    },

    /**
     * Sinks the node at the given index down until its in a sorted position
     * Does nothing if the element is already in the correct position
     *
     * @param  {int} index - The index of the element to sink
     */
    sink: function (index) {
        while (true) {
            // Find the smaller of the left and right children
            var rightChildIndex = index * 2 + 2;
            var leftChildIndex = rightChildIndex - 1;
            var smallerChildIndex = this.v[rightChildIndex] < this.v[leftChildIndex]
                ? rightChildIndex : leftChildIndex;

            // If there are no children then stop sinking
            if (this.v[leftChildIndex] === undefined) {
                break;
            }

            // If the smaller child is less than the sinking node then swap them
            if (this.v[smallerChildIndex] < this.v[index]) {
                var swap = this.v[smallerChildIndex];
                this.v[smallerChildIndex] = this.v[index];
                this.v[index] = swap;

                swap = this.e[smallerChildIndex];
                this.e[smallerChildIndex] = this.e[index];
                this.e[index] = swap;

                // Repeat the loop at the new position of the sinking node
                index = smallerChildIndex;
            } else {
                // The node is smaller than its children which means it is correctly sorted
                break;
            }

            // If the index is greater or equal to half the heap size then it is guarenteed to
            // be a leaf node. Leaves cannot sink further so stop looping.
            if (index >= this.length / 2) {
                break;
            }
        }

        return this;
    },

    /**
     * Swaps the node at the given index upwards through the heap until it is in a sorted position
     * Does nothing if the element is already in the correct position
     *
     * @param  {int} index - Index of the element to bubble up
     */
    bubble: function (index) {
        while (index !== 0) {
            var parentIndex = Math.floor((index - 1) / 2);
            if (this.v[parentIndex] > this.v[index]) {
                // Swap the value
                var swap = this.v[index];
                this.v[index] = this.v[parentIndex];
                this.v[parentIndex] = swap;
                // Swap the element
                swap = this.e[index];
                this.e[index] = this.e[parentIndex];
                this.e[parentIndex] = swap;
                // Repeat the loop starting at the new position of the inserted element
                index = parentIndex;
            } else {
                // The value cannot be swapped and therefore must be in a sorted position already
                break;
            }
        }

        return this;
    },

    /**
     * Returns the element at the top of the heap without popping it
     */
    peek: function () {
        return this.e[0];
    },

    /**
     * Given any arrangement of values in the underlying arrays of this heap.
     * This function will sort them to restore heapiness.
     *
     * Starting at the last non-leaf node, the node is sunk until it is sorted.
     * After sinking the entire subtree that the node was the root of will be a valid heap.
     *
     * This is repeated for the previous node (previous in array position, 3, 2, 1, 0 ...)
     * The nodes below will already be valid heaps, so after sinking higher nodes it is guarenteed that
     * the lower nodes will still be valid heaps.
     *
     * Once all non-leaf nodes have been sunk the heap will be valid.
     */
    heapify: function () {
        // get the index of the last node that has no children
        var lastNonLeafIndex = Math.floor(this.length / 2) - 1;

        // Sink this node and every node before it until the root
        for (var index = lastNonLeafIndex; index >= 0; --index) {
            this.sink(index);
        }

        return this;
    },
}
