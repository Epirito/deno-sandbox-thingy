import { entities } from "../stuff/entities.ts";
import { examinables } from "../stuff/examinables.ts";
import random from "../utils/random.ts";
import { ActionRequester } from "./trivial-systems.ts";
import { Action, SaturatedAction } from "./action.ts";
import { Entity } from "./entity.ts";
import { ThingManager } from "./thing-manager.ts";
import { Game } from "multiplayer";
import { Clock } from "./clock.ts";
export interface System {
    cleanUpDestroyed?(entity: Entity): void;
    copy(dependencies?: Record<string, System>): System
}
export interface ISimulation {
    systems: Record<string, System>;
    onActionDone?: ({action, terms}: {action: Action, terms: Entity[]})=>void;
    onActionFailed?: ({action, terms, error}: {action: Action, terms: (Entity | undefined)[], error: string})=>void;
    doAction: (actionIota: number, ids: string[], vals?: Record<string, unknown>)=>void;
}
export default class Simulation implements Game<SaturatedAction, Simulation>, ISimulation {
    static hierarchy = [
        ['clock', 'actionRequester', 'thingManager'],
        ['phys', 'scheduler'],
        ['container', 'electricity']
    ]
    constructor(readonly systems: {[x: string]: System}, public onActionDone?: (data: {action: Action, terms: Entity[]})=>void, public onActionFailed?: (data: {action: Action, terms: (Entity | undefined)[], error: string})=>void) {
        const thingManager = (this.systems['thingManager'] as ThingManager)
        thingManager['make'] = this.make;
        thingManager['destroy'] = this.destroy;
        (this.systems['actionRequester'] as ActionRequester)['doAction'] = this.doAction;
    }
    doAction = (actionIota: number, ids: string[], vals?: Record<string, unknown>)=>{
        const action = Action.byIota(actionIota)!
        const terms = ids.map(x=>(this.systems['thingManager'] as ThingManager).entityById.get(x))
        if (terms.some(x=>x===undefined)) {
            this.onActionFailed!({action, terms, error: 'missing entity'})
            return
        }
        const error = action.effect?.(this.systems)(terms as Entity[], vals)
        if (error===undefined) {
            this.onActionDone!({action, terms: terms as Entity[]})
        }else {
            this.onActionFailed!({action, terms: terms as Entity[], error})
        }
    }
    
    destroy(entity: Entity) {
        for(const system in this.systems) {
            this.systems[system].cleanUpDestroyed?.(entity)
        }
        (this.systems['thingManager'] as ThingManager).entityById.delete(entity.id)
    }
    make = (thing: string)=>{
        const entity = entities[thing](this.systems,(this.systems['thingManager'] as ThingManager).bareEntity(1))
        entity.examinableComp = examinables[thing]
        entity.essence = thing
        return entity
    }
    tick(moves: { player: number; action: SaturatedAction; }[]): void {
        for(const move of moves) {
            this.doAction(...move.action)
        }
        (this.systems['clock'] as Clock).tick()
    }
    copy() {
        const systems: {[x: string]: System} = {}
        for(const tier in Simulation.hierarchy) {
            for(const system of Simulation.hierarchy[tier]) {
                systems[system] = this.systems[system].copy(systems)
            }
        }
        const newSim = new Simulation(systems)
        return newSim
    }
    get t(): number {
        return (this.systems['clock'] as Clock).t
    }
}