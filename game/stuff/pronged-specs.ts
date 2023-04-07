import { ProngSpec, ProngSystem, ProngedSpec, Signal, signalHop } from "../logic/prong.ts";
import { LightSourceComponent } from "../logic/lighting.ts";
import { Entity } from "../logic/entity.ts";
import { Scheduler } from "../logic/scheduler.ts";
import { muxDequeue, turnOff } from "./world-actions.ts";
import { ActionRequester } from "../logic/trivial-systems.ts";
import { System } from "../logic/simulation.ts";
type ProngedSpecFactory = (dependencies: Record<string, System>)=>ProngedSpec
export const inputSpec: ProngedSpecFactory = dependencies=> {
    const electricity = dependencies.electricity as ProngSystem;
    return {
        prongsBySystem: new Map([
            [
                electricity,
                {
                    inputs: [] as ProngSpec[],
                    outputs: [
                        new ProngSpec([1,0], "")
                    ],
                },
            ]
        ]),
    }
}
export const lampSpec: ProngedSpecFactory = dependencies=> {
    const electricity = dependencies.electricity as ProngSystem;
    const scheduler = dependencies['scheduler'] as Scheduler;
    return {
        prongsBySystem: new Map([
            [
                electricity,
                {
                    inputs: [
                        new ProngSpec([0,0], "")
                    ],
                    outputs: [] as ProngSpec[],
                },
            ]
        ]),
        inputListenerFactories: new Map([
            ["", (entity: Entity)=> (_: Signal)=> {
                entity.lightSourceComp = new LightSourceComponent(5);
                scheduler.clear(entity.timeOut);
                entity.timeOut = scheduler.schedule(60, turnOff.from([entity], {}))
            }]
        ]),
    }
}
export const wireSpec: ProngedSpecFactory = dependencies => {
    const electricity = dependencies.electricity as ProngSystem;
    return {
        prongsBySystem: new Map([
            [
                electricity,
                {
                    inputs: [
                        new ProngSpec([0,0], "")
                    ],
                    outputs: [
                        new ProngSpec([1, 0], ""),
                        new ProngSpec([-1, 0], ""),
                        new ProngSpec([0, 1], ""),
                        new ProngSpec([0, -1], ""),
                    ],
                },
            ],
        ]),
        inputListenerFactories: new Map([
            ["", electricity.makeRelayInputListener]
        ])
    }
};
export const bimuxSpec: ProngedSpecFactory = dependencies => {
    const {scheduler, electricity} = (dependencies as {scheduler: Scheduler, actionRequester: ActionRequester, electricity: ProngSystem});
    const  makeDemuxListener = (entity: Entity)=> (signal: Signal) => {
        if (signal.lastHop === entity.id) {
            return
        }
        const newSignal = Object.assign({}, signal)
        const prong = newSignal.muxStack.pop()
        if (prong) {
            electricity.entityOutput(entity, prong, signalHop(newSignal, entity))
        }
    }
    const makeMuxListener = (prong: string)=> (entity: Entity)=> (signal: Signal) => {
        if (signal.lastHop === entity.id) {
            return
        }
        entity.signalQueueComp!.push({prong, signal})
        if (entity.signalQueueComp!.length===1) {
            scheduler.schedule!(2, muxDequeue.from([entity]))
        }
    }
    return {
        prongsBySystem: new Map([
            [
                electricity,
                {
                    inputs: [
                        new ProngSpec([1,0], ""),
                        new ProngSpec([0,-1], "a"),
                        new ProngSpec([-1,0], "b"),
                        new ProngSpec([0,1], "c"),
                    ],
                    outputs: [
                        new ProngSpec([1, 0], ""),
                        new ProngSpec([0, -1], "a"),
                        new ProngSpec([-1, 0], "b"),
                        new ProngSpec([0, 1], "c"),
                    ],
                },
            ],
        ]),
        inputListenerFactories: new Map([
            ["", makeDemuxListener],
            ["a", makeMuxListener("a")],
            ["b", makeMuxListener("b")],
            ["c", makeMuxListener("c")],
        ]),
    }
};