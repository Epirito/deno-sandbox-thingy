import { SaturatedAction, Action } from "../logic/action.ts";
import { damage } from "../logic/damageable.ts";
import { Entity } from "../logic/entity.ts";
import { PhysicsSystem } from "../logic/physics.ts";
import { ProngSystem, defaultSignal, signalHop } from "../logic/prong.ts";
import { Scheduler } from "../logic/scheduler.ts";
import { ThingManager } from "../logic/thing-manager.ts";
import { ActionRequester, ContainerSystem, containerDependency, systemDependency } from "../mod.ts";
import { rotatedBy } from "../utils/vector.ts";
import { sum } from "../utils/vector.ts";
import { push } from "./actions.ts";

export const schedule = new Action(true, undefined, dependencies=>(_, vals)=> {
    const {scheduler} = dependencies as {scheduler: Scheduler}
    const scheduledAction = vals!['action'] as SaturatedAction
    const delay = vals!['delay'] as number
    scheduler.schedule(delay, scheduledAction)
})
export const onPlacedOnBelt = new Action(true, undefined, dependencies=>(terms, _)=> {
    const {phys, scheduler} = dependencies as {phys: PhysicsSystem, scheduler: Scheduler}
    const [belt, entity] = terms
    
    const pos = phys.position(belt)!
    if (entity!==belt) {
        belt.timeOut = scheduler.schedule(6, [push.iota, [entity.id], {position: pos, rotation: phys.rotation(belt)!}])
    }
})
export const onPressureListenerPlaced = new Action(true, undefined, dependencies=>(terms, vals)=>{
    const {phys} = dependencies as {phys: PhysicsSystem, scheduler: Scheduler}
    const [entity] = terms
    const {listener} = vals as {listener: SaturatedAction}
    phys.onPlacedAt(phys.position(entity)!, listener)    
})
export const onPressureListenerUnplaced = new Action(true, undefined, dependencies=>(terms, vals)=>{
    const {phys, scheduler} = dependencies as {phys: PhysicsSystem, scheduler: Scheduler}
    const [belt] = terms
    const {listener} = vals as {listener: SaturatedAction}
    scheduler.clear(belt.timeOut)
    phys.removeOnPlacedAt(phys.position(belt)!, listener)
})

const triggeringSize = 3
export const pressurePlateDetection = new Action(true, undefined, dependencies=>(terms, vals)=>{
    const {phys, electricity, scheduler} = dependencies as {
        phys: PhysicsSystem, electricity: ProngSystem, scheduler: Scheduler
    }
    const [plate] = terms as Entity[]
    const {delay} = vals as {delay: number}
    
    function getCombinedSize() {
        return phys.entitiesAt(phys.position(plate)!).reduce((acc, entity)=>acc+entity.size, 0)
    }
    if (getCombinedSize()>triggeringSize) {
        electricity.entityOutput(plate, "", defaultSignal)
        plate.timeOut = scheduler.schedule(delay, pressurePlateDetection.from([plate], {delay}))
    }else {
        scheduler.clear(plate.timeOut)
    }
})
export const turnOff = new Action(true, undefined, _=>(terms, _)=>{
    const [entity] = terms
    entity.lightSourceComp = undefined
})
export const muxDequeue = new Action(true, undefined, dependencies=>(terms, _)=>{
    const {electricity, scheduler} = dependencies as {electricity: ProngSystem, scheduler: Scheduler}
    const [entity] = terms
    const signalKind = entity.signalQueueComp!.shift()
    console.log(signalKind)
    if (signalKind) {
        const outputSignal = signalHop(signalKind.signal, entity)
        outputSignal.muxStack.push(signalKind.prong)
        electricity.entityOutput(entity, '', outputSignal)
    }
    if (entity.signalQueueComp!.length>0) {
        scheduler.schedule(2, muxDequeue.from([entity]))
    }
})
const destroySync = new Action(true, undefined, dependencies=>(terms, _)=>{
    const {thingManager} = dependencies as {thingManager: ThingManager}
    const [entity] = terms
    thingManager.destroy!(entity)
})
export const destroy = new Action(true, undefined, dependencies=>(terms, _)=>{
    const {scheduler} = dependencies as {scheduler: Scheduler}
    scheduler.schedule(0, destroySync.from(terms))
})
export const collision = new Action(true, undefined, dependencies=>(terms, vals)=>{
    const [movingEntity] = terms
    const {axis, hitPos} = vals as {axis: 0|1, hitPos: [number, number]}
    const {phys, actionRequester} = dependencies as {phys: PhysicsSystem, actionRequester: ActionRequester}
    const hitEntity = phys.entitiesAt(hitPos).find(entity=>entity.blocksMovement)!
    const relSpd = Math.abs(movingEntity.speedComp!.spd[axis] - (hitEntity.speedComp?.spd[axis] ?? 0))
    const momentum0 = relSpd * movingEntity.size
    damage(actionRequester, hitEntity, momentum0)
    const momentum1 = relSpd * hitEntity.size
    damage(actionRequester, movingEntity, momentum1)
})
export const enter = new Action(true, undefined, 
    containerDependency(container=>(terms,_)=>{
        const [a, b] = terms
        return container.tryEnter(a, b)
    })
)
export const projectileHit = new Action(true, undefined,
    (dependencies)=>(terms, vals)=>{
        const [bullet, entity] = terms
        const {actionRequester} = dependencies as {actionRequester: ActionRequester}
        const {dmg} = vals as {dmg: number}
        damage(actionRequester, entity, dmg)
        actionRequester.doAction(...destroy.from([bullet]))
    }
)