import { equals, rotatedBy, scalarMult, sum } from "../utils/vector.ts";
import { Action } from "../logic/action.ts";
import {ContainerSystem, containerDependency} from "../logic/container.ts";
import { Entity } from "../logic/entity.ts";
import { PhysicsSystem } from "../logic/physics.ts";
import { System } from "../logic/simulation.ts";
import { ThingManager } from "../logic/thing-manager.ts";
import { examinables } from "./examinables.ts";
import { ActionRequester } from "../mod.ts";
import { SpeedComponent, applySpeed } from "../logic/speed-based-physics.ts";
import { destroy, enter, projectileHit } from "./world-actions.ts";
import { TerrainSystem } from "../logic/terrain.ts";
import { terrainSpecs } from "./terrain-specs.ts";

export const push = new Action(false,undefined, dependencies=>(terms, vals)=>{
    const {phys} = dependencies as {phys: PhysicsSystem}
    const [entity] = terms
    const {position, rotation} = vals as {position: [number, number], rotation: number}

    const entityPos = phys.position(entity)
    if (entityPos && equals(entityPos, position)) {
        phys.placeIfNotBlocked(entity, sum(position, rotatedBy([1,0], rotation)))
    }
})


export const interact = new Action(false,(terms) => `${terms[0]} interacts with ${terms[1]}`, 
    (deps)=>(terms, vals)=>{
        const {actionRequester} = deps as {actionRequester: ActionRequester}
        const [user, entity] = terms;
        actionRequester.doAction(...entity.interactComp!(user, entity))
    }
);
export const use = new Action(false, 
    (terms) => `${terms[0]} uses item`, 
    (dependencies: Record<string, System>)=>(terms: Entity[], vals?: Record<string, unknown>)=>{
        const {container, actionRequester} = dependencies as {container: ContainerSystem, actionRequester: ActionRequester}
        const [user] = terms
        const item = container.getEquipped(user)
        const hoverPos = vals?.['hoverPos'] as [number, number] | undefined
        if (item) {
            const action = item.useComp
            if (action) {
                actionRequester.doAction(...action(user, hoverPos))
                return
            }
            return "Nothing happens"
        }
        return "Nothing equipped"
    }
)
export const open = new Action(false,
    (terms) => `${terms[0]} opens ${terms[1]}`
);
export const drop = new Action(false,
    (terms) => `${terms[0]} drops item`, 
    containerDependency(container=>terms=>{return container.tryDrop(terms[0])})
);
export const pickUp = new Action(false,
    (terms) => `${terms[0]} picks up ${terms[1]}`, 
    containerDependency(container=>terms=>{return container.tryPickUp(terms[0], terms[1])})
);
export const withdraw = new Action(false,
    (terms) => `${terms[0]} withdraws ${terms[1]} from ${terms[2]}`,
    containerDependency(container=>terms=>{
        return container.tryWithdraw(terms[0], terms[1], terms[2])
    })
)
export const insertInto = new Action(false,
    (terms) => `${terms[0]} inserts into ${terms[1]}`, 
    containerDependency(container=>terms=>{return container.tryInsertInto(terms[0], terms[1])})
);
export const walk = new Action(false,
    undefined,
    (dependencies: Record<string, unknown>)=>(terms: Entity[], vals?: Record<string, unknown>)=> {
        const {rotation} = (vals as {rotation: number});
        const {phys} = dependencies as {phys: PhysicsSystem};
        phys.place(terms[0], {rotation})
        const destination = phys.inFrontOf(terms[0])
        if (!phys.placeIfNotBlocked(terms[0], destination)) {
            return 'blocked'
        }
    }
);
export const craft = new Action(false,
    (terms) => `${terms[0]} crafts item on ${terms[1]}`,
    (dependencies: Record<string, unknown>)=>(terms: Entity[], vals?: Record<string, unknown>)=> {
        const {container} = dependencies as {container: ContainerSystem};
        const [actor, table] = terms;
        const result = container.tryCraft(actor, vals!['i'] as number, table);
        if (result) {
            return result
        }
    }
)
export const emitProjectileTo = new Action(true,
    undefined,
    (dependencies: Record<string, unknown>)=>(terms: Entity[], vals?: Record<string, unknown>)=> {
        const {thingManager, phys, actionRequester} = dependencies as {thingManager: ThingManager, phys: PhysicsSystem, actionRequester: ActionRequester};
        const [actor] = terms;
        const target = vals?.['hoverPos'] as [number, number] | undefined
        if (target) {
            const bullet = thingManager.bareEntity(1)
            bullet.speedComp = new SpeedComponent((hitPos, _)=>{
                const targetEntity = phys.entitiesAt(hitPos).find(e=>e.blocksMovement)
                if (targetEntity) {
                    return projectileHit.from([bullet, targetEntity], {dmg: 20})
                }
            })
            bullet.examinableComp = examinables.bullet
            phys.place(bullet, {position: phys.position(actor)!, rotation: phys.rotation(actor)!})
            
            const delta = sum(target, scalarMult(-1, phys.position(actor)!))
            const normalizedDelta = scalarMult(1/Math.sqrt(delta[0]**2 + delta[1]**2), delta)
            const SPD = 50
            actionRequester.doAction!(...applySpeed.from([bullet], {spd: scalarMult(SPD, normalizedDelta)}))
        }
    }
)
export const axeCutAction = new Action(false, undefined, (dependencies: Record<string, unknown>)=>(terms: Entity[], vals?: Record<string, unknown>)=> {
    const {phys, terrain} = dependencies as {phys: PhysicsSystem, terrain: TerrainSystem};
    const [actor] = terms;
    //const hoverPos = vals?.['hoverPos'] as [number, number] | undefined
    const targetPos = phys.inFrontOf(actor)!
    //unimplemented
})
export const pickStrikeAction = new Action(false, undefined, (dependencies: Record<string, unknown>)=>(terms: Entity[], vals?: Record<string, unknown>)=> {
    const {phys, terrain} = dependencies as {phys: PhysicsSystem, terrain: TerrainSystem};
    const [actor] = terms;
    const pos = phys.position(actor)!
    if (terrain.get(pos)!.harvesting['pick']) {
        terrain.set(pos, terrainSpecs.dirt)
    }
})
export const shoot2 = (user: Entity, hoverPos: [number, number] | undefined) => emitProjectileTo.from([user], {hoverPos})
export const axeCut = (user: Entity, hoverPos: [number, number] | undefined) => destroy.from([user], {hoverPos})
export const pickStrike = (user: Entity, hoverPos: [number, number] | undefined) => pickStrikeAction.from([user], {hoverPos})

export const drive = (user: Entity, entity: Entity)=> enter.from([user, entity], {})
