import { PriorityQueue } from "../utils/priority-queue.ts";
import { SaturatedAction } from "./action.ts";
import { Clock } from "./clock.ts";
import { System } from "./simulation.ts";
import { ActionRequester } from "./trivial-systems.ts";

export class Scheduler implements System {
    priorityQueue!: PriorityQueue<SaturatedAction>
    clock!: Clock
    actionRequester!: ActionRequester
    constructor(dependencies: Record<string, System>, priorityQueue?: PriorityQueue<SaturatedAction>) {
        this.priorityQueue = priorityQueue ?? new PriorityQueue()
        this.clock = dependencies['clock'] as Clock
        this.actionRequester = dependencies['actionRequester']
        this.clock.onTick((evt: Event) => {
            if ((evt as CustomEvent).detail >= this.priorityQueue.head()?.[0]) {
                const [actionIota, termIds, val] = this.priorityQueue.dequeue()!
                console.log(val)
                this.actionRequester.doAction!(actionIota, termIds, val)
            }
        })
    }
    schedule(delay: number, action: SaturatedAction) {
        this.priorityQueue.enqueue(this.clock.t + delay, action)
        return action
    }
    clear(action: SaturatedAction | undefined) {
        if (action) {
            this.priorityQueue.remove(action)
        }
    }
    copy(dependencies: Record<string, System>) {
        return new Scheduler(dependencies, new PriorityQueue(this.priorityQueue.elements))
    }
}