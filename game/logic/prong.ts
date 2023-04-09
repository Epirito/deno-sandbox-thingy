import { Entity } from "./entity.ts";
import {PhysicsSystem} from "./physics.ts";
import { absPosition } from "../utils/vector.ts";
import identityFunction from "../utils/identity-function.ts";
import { System } from "./simulation.ts";
import { Action } from "./action.ts";
import { Scheduler } from "./scheduler.ts";
import { ThingManager } from "./thing-manager.ts";

export class ProngSpec {
    constructor(
        readonly attachedVector: [number, number],
        readonly kind: string
    ) {}
}

export interface ProngedSpec {
    prongsBySystem: Map<
        ProngSystem,
        {
        inputs: Array<ProngSpec>;
        outputs: Array<ProngSpec>;
        }
    >;
    inputListenerFactories?: Map<string, (prongedEntity: Entity)=>(signal: Signal)=>void>
}
export interface IProngedComponent {
    readonly prongedSpec: ProngedSpec
}
export class ProngedComponent implements IProngedComponent {
    private inputListenerByInputKind?: Map<string, (event: CustomEvent)=>void>
    inputListener(inputKind: string) {
        return this.inputListenerByInputKind?.get(inputKind);
    }
    constructor(readonly prongedSpec: ProngedSpec, me: Entity) {
        if (prongedSpec.inputListenerFactories) {
            this.inputListenerByInputKind = new Map();
            prongedSpec.inputListenerFactories.forEach((factory, inputKind)=>{
                this.inputListenerByInputKind!.set(inputKind, event=>factory(me)(event.detail))
            })
        }
    }
    copy(newEntity: Entity) {
        return new ProngedComponent(this.prongedSpec, newEntity)
    }
}

export interface Signal {
    muxStack: string[]
    lastHop?: string
}
export function signalHop(signal: Signal, entity: Entity) {
    const newSignal = Object.assign({}, signal)
    newSignal.lastHop = entity.id
    return newSignal
}
export const defaultSignal: Signal = {
    muxStack: [],
};
export interface IProngSystem extends System {
    isRateLimited(position: [number, number]): boolean
}

export class ProngSystem implements IProngSystem {
    private eventField = new EventTarget();
    private rateLimitedPoints = new Set<string>();
    private pluggingReconstruction: string[] = []
    static plug = new Action(true, undefined, dependencies=>(terms, _) => {
        const {electricity} = dependencies as {electricity: ProngSystem}
        const [entity] = terms
        electricity.plug(entity)
    })
    static unplug = new Action(true, undefined, dependencies=>(terms, _) => {
        const {electricity} = dependencies as {electricity: ProngSystem}
        const [entity] = terms
        electricity.unplug(entity)
    })
    static stopRateLimiting = new Action(true, undefined, dependencies=>(_, vals)=>{
        // a glimpse into how prong system dependencies will work when electricity is no longer hardcoded
        const {prongSystemName} = vals as {prongSystemName: string}
        const prongSystem = dependencies[prongSystemName] as ProngSystem
        prongSystem.rateLimitedPoints.delete(vals!['point'] as string)
    })
    phys: PhysicsSystem;
    scheduler: Scheduler;
    constructor(dependencies: Record<string, unknown>) {
        this.phys = dependencies['phys'] as PhysicsSystem;
        this.scheduler = dependencies['scheduler'] as Scheduler;
    }
    output(fromPosition: [number, number], signal: Signal) {
        const jsonPoint= JSON.stringify(fromPosition)
        if (this.rateLimitedPoints.has(jsonPoint)) {
            return
        }
        this.rateLimitedPoints.add(jsonPoint)
        // for now electricity is hardcoded as the only prong system:
        this.scheduler.schedule(1, ProngSystem.stopRateLimiting.from([], {point: jsonPoint, prongSystemName: 'electricity'}))
        this.eventField.dispatchEvent(
            new CustomEvent(jsonPoint, { detail: signal })
        );
    }
    entityOutput(fromEntity: Entity, prongKind: string, signal: Signal) {
        fromEntity.prongedComp?.prongedSpec.prongsBySystem.get(this)
        ?.outputs.forEach((output) => {
            if (output.kind === prongKind) {
            const absPos = absPosition(output.attachedVector, 
                this.phys.position(fromEntity)!, 
                this.phys.rotation(fromEntity)!);
            this.output(absPos, signal);
            }
        });
    }
    private unplug(entity: Entity) {
        entity.prongedComp?.prongedSpec.prongsBySystem.get(this)?.inputs.forEach((input) => {
        this.eventField.removeEventListener(
            JSON.stringify(absPosition(input.attachedVector, 
                this.phys.position(entity)!, 
                this.phys.rotation(entity)!)),
            (entity.prongedComp!.inputListener(input.kind)! as (evt: Event)=>void)
        );
        });
        this.pluggingReconstruction.splice(this.pluggingReconstruction.indexOf(entity.id))
    }
    private plug(entity: Entity) {
        entity.prongedComp?.prongedSpec.prongsBySystem.get(this)?.inputs.forEach((input) => {
        this.eventField.addEventListener(
            JSON.stringify(absPosition(input.attachedVector, 
                this.phys.position(entity)!, 
                this.phys.rotation(entity)!)),
            (entity.prongedComp!.inputListener(input.kind)! as (evt: Event)=>void)
        );
        });
        this.pluggingReconstruction.push(entity.id)
    }
    addEntity(entity: Entity) {
        this.phys.onUnplaced(entity, [ProngSystem.unplug.iota, [entity.id], {}]);
        this.phys.onPlaced(entity, [ProngSystem.plug.iota, [entity.id], {}]);
    }
    makeRelayInputListener = (entity: Entity, processing: (signal: Signal) => Signal = identityFunction)=>{
        return (signal: Signal)=>{
            const newSignal = processing(signal);
            this.entityOutput(entity, '', newSignal);
        }
    }
    isRateLimited(position: [number, number]) {
        return this.rateLimitedPoints.has(JSON.stringify(position))
    }
    copy(dependencies: Record<string, System>) {
        const copy = new ProngSystem(dependencies)
        this.pluggingReconstruction.forEach(id=>{
            copy.plug((dependencies['thingManager'] as ThingManager).byId(id)!)
        })
        return copy
    }
}