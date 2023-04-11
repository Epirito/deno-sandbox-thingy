import { TemplateExpression } from "https://deno.land/x/ts_morph@17.0.1/ts_morph.js"
import { System } from "../mod.ts"
import { sum } from "../utils/vector.ts"
import { Action, SaturatedAction } from "./action.ts"
import { Entity } from "./entity.ts"
import { PhysicsSystem } from "./physics.ts"
import { Scheduler } from "./scheduler.ts"
import { ActionRequester } from "./trivial-systems.ts"

export class SpeedComponent {
    spd: [number, number] = [0, 0]
    remainders: [number, number] = [0, 0]
    scheduledMove: [SaturatedAction | undefined, SaturatedAction | undefined] = [undefined, undefined]
    constructor(public onCollision?: (hitPos: [number, number], axis: 0|1)=>SaturatedAction | undefined){}
}
export const applySpeed = new Action(true, undefined, dependencies=>(terms, vals)=>{
    const {phys, scheduler, actionRequester} = dependencies as {phys: PhysicsSystem, scheduler: Scheduler, actionRequester: ActionRequester}
    const [entity] = terms
    const {spd, axis} = vals as {spd: [number, number], axis: 0|1|undefined}
    const speedComp = entity.speedComp
    speedComp!.spd = sum(spd, speedComp!.spd)
    function getDelay(spd: number, axis:0|1) {
        const consumedRemainder = Math.floor(speedComp!.remainders[axis])
        const currentDelay = Math.floor(60/Math.abs(spd))
        const delay = currentDelay + consumedRemainder
        speedComp!.remainders[axis] -= consumedRemainder
        speedComp!.remainders[axis] += delay - currentDelay
        return delay
    }
    function applyToAxis(axis: 0|1, immediate=true) {
        if (speedComp!.spd[axis]!==0) {
        scheduler.clear(speedComp!.scheduledMove?.[axis])
        const delta = Math.sign(speedComp!.spd[axis])
        const deltaVec = [0, 0] as [number, number]
        deltaVec[axis] = delta
        if (immediate) {
            if (!phys.moveAxis(entity, delta, axis as 0|1)) {
                if (speedComp!.onCollision) {
                    const action = speedComp!.onCollision(sum(phys.position(entity)!, deltaVec), axis as 0|1)
                    if (action) {
                        actionRequester.doAction(...action);
                    }
                }
                speedComp!.spd[axis] = 0
                return
            }
        }
        const scheduledAxisMove = applySpeed.from([entity], {spd, axis})
        speedComp!.scheduledMove[axis] = scheduledAxisMove
        scheduler.schedule(getDelay(spd[axis], axis), scheduledAxisMove)
    }}
    if (axis===undefined) {
        const fastAxis = Math.abs(spd[0])>Math.abs(spd[1]) ? 0 : 1
        applyToAxis(fastAxis)
        const slowAxis = fastAxis===0 ? 1 : 0
        if (spd[slowAxis]!==0) {
            scheduler.schedule(getDelay(spd[slowAxis]*2, slowAxis), applySpeed.from([entity], {spd, axis: slowAxis}))
        }
    }else {
        applyToAxis(axis)
    }
})