export class PriorityQueue<T> {
    private queue: [number, T][]
    constructor(sortedElements?: [number, T][]) {
        if (sortedElements) {
            this.queue = sortedElements
        }else {
            this.queue = []
        }
    }
    enqueue(priority: number, item: T) {
        this.queue.push([priority, item])
        this.queue.sort(([a,_], [b,_1])=>a-b)
    }
    dequeue() {return this.queue.shift()?.[1]}
    remove(item: T) {
        this.queue = this.queue.filter(([,i])=>i!==item)
    }
    head() {return this.queue[0]}
    get elements() {
        return [...this.queue]
    }
}