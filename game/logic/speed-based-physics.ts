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
    scheduledXmove?: SaturatedAction
    onCollision?: (hitPos: [number, number], axis: 0|1)=>SaturatedAction | undefined
}
export const applySpeed = new Action(true, undefined, dependencies=>(terms, vals)=>{
    const {phys, scheduler, actionRequester} = dependencies as {phys: PhysicsSystem, scheduler: Scheduler, actionRequester: ActionRequester}
    const [entity] = terms
    const {spd, initial} = vals as {spd: [number, number], initial: boolean}
    const speedComp = entity.speedComp
    speedComp!.spd = sum(spd, speedComp!.spd)
    if (initial) {
        scheduler.clear(speedComp!.scheduledXmove)
    }
    for (let axis = 0; axis < 2; axis++) {
        if (speedComp!.spd[axis]!==0) {
            const delta = Math.sign(speedComp!.spd[axis])
            const deltaVec = [0, 0] as [number, number]
            deltaVec[axis] = delta
            if (!phys.moveAxis(entity, delta, axis as 0|1)) {
                if (speedComp!.onCollision) {
                    const action = speedComp!.onCollision(sum(phys.position(entity)!, deltaVec), axis as 0|1)
                    if (action) {
                        actionRequester.doAction(...action);
                    }
                }
                speedComp!.spd[axis] = 0
                continue
            }
            const scheduledXmove = applySpeed.from([entity], {spd})
            speedComp!.scheduledXmove = scheduledXmove
            scheduler.schedule(60/Math.abs(spd[axis]), scheduledXmove)
        }
    }
})