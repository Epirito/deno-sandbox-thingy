import { SaturatedAction, Action } from "../logic/action.ts";
import { Entity } from "../logic/entity.ts";
import { PhysicsSystem } from "../logic/physics.ts";
import { ProngSystem, defaultSignal, signalHop } from "../logic/prong.ts";
import { Scheduler } from "../logic/scheduler.ts";
import { push } from "./actions.ts";

export const schedule = new Action(undefined, dependencies=>(_, vals)=> {
    const {scheduler} = dependencies as {scheduler: Scheduler}
    const scheduledAction = vals!['action'] as SaturatedAction
    const delay = vals!['delay'] as number
    scheduler.schedule(delay, scheduledAction)
})
export const onPlacedOnBelt = new Action(undefined, dependencies=>(terms, _)=> {
    const {phys, scheduler} = dependencies as {phys: PhysicsSystem, scheduler: Scheduler}
    const [belt, entity] = terms
    
    const pos = phys.position(belt)!
    if (entity!==belt) {
        belt.timeOut = scheduler.schedule(6, [push.iota, [entity.id], {position: pos, rotation: phys.rotation(belt)!}])
    }
})
export const onPressureListenerPlaced = new Action(undefined, dependencies=>(terms, vals)=>{
    const {phys} = dependencies as {phys: PhysicsSystem, scheduler: Scheduler}
    const [entity] = terms
    const {listener} = vals as {listener: SaturatedAction}
    phys.onPlacedAt(phys.position(entity)!, listener)    
})
export const onPressureListenerUnplaced = new Action(undefined, dependencies=>(terms, vals)=>{
    const {phys, scheduler} = dependencies as {phys: PhysicsSystem, scheduler: Scheduler}
    const [belt] = terms
    const {listener} = vals as {listener: SaturatedAction}
    scheduler.clear(belt.timeOut)
    phys.removeOnPlacedAt(phys.position(belt)!, listener)
})

const triggeringSize = 3
export const pressurePlateDetection = new Action(undefined, dependencies=>(terms, vals)=>{
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
export const turnOff = new Action(undefined, _=>(terms, _)=>{
    const [entity] = terms
    entity.lightSourceComp = undefined
})
export const muxDequeue = new Action(undefined, dependencies=>(terms, _)=>{
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