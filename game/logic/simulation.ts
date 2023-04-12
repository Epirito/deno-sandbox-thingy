import { entities } from "../stuff/entities.ts";
import { examinables } from "../stuff/examinables.ts";
import random from "../utils/random.ts";
import { ActionRequester } from "./trivial-systems.ts";
import { Action, SaturatedAction } from "./action.ts";
import { Entity, IEntity } from "./entity.ts";
import { ThingManager } from "./thing-manager.ts";
import { Clock } from "./clock.ts";
import { Game } from "modularMultiplayer";
import { drive, insertInto, interact, open, withdraw } from "../mod.ts";
import { PhysicsSystem } from "./physics.ts";
import { ProngSystem } from "./prong.ts";
import { ContainerSystem } from "./container.ts";
import { Scheduler } from "./scheduler.ts";
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
type PlayerData = {
    name: string;
    playerId: number;
    entityId: string;
    listFront: boolean;
    openContainer?: IEntity
}

export class SimulationWrapper implements Game<SaturatedAction, SimulationWrapper> {
    private playersByPlayerId: Map<number, PlayerData> = new Map();
    private playersByEntityId: Map<string, PlayerData> = new Map();
    playerById(id: number) {
        return this.playersByPlayerId.get(id)
    }
    constructor(readonly sim: Simulation, {playerEntityIds, playerData}: {
        playerEntityIds?: string[], 
        playerData?: PlayerData[]
    }) {
        playerData?.forEach((data) => {
            this.playersByPlayerId.set(data.playerId, data)
            this.playersByEntityId.set(data.entityId, data)
        })
        playerEntityIds?.forEach((id, i) => {
            const player = {name: "joe", entityId: id, listFront: false, openContainer: undefined} as PlayerData
            this.playersByPlayerId.set(i, player)
            this.playersByEntityId.set(id, player)
        })
        sim.onActionDone = ({action, terms}) => {
            if (action.world) {
                return
            }
            const playerData = this.playersByEntityId.get(terms[0].id)
            if (!playerData) {
                return
            }
            playerData.listFront = false;
            if (action===open) {
                playerData.openContainer = terms[1]
                return
            } 
            if ([insertInto, withdraw].includes(action)) {
                return
            }
            playerData.openContainer = undefined
            if (action===interact) {
                if (terms[1].interactComp===drive) {
                    playerData.entityId = terms[1].id
                    this.playersByEntityId.set(terms[1].id, playerData)
                    this.playersByEntityId.delete(terms[0].id)
                }
            } 
        }
        sim.onActionFailed = ({action, terms, error}) => {
            if (!action.world) {
                const playerData = this.playersByEntityId.get(terms[0]?.id as string);
                if (error==='blocked' && playerData) {
                    playerData.listFront = true;
                }
                console.log(action, terms, error);
            }
        }
    }
    copy() {
        return new SimulationWrapper(this.sim.copy(), {playerData: [...this.playersByPlayerId.values()]})
    }
    makeMove(player: number, action: SaturatedAction) {
        this.sim.doAction(action[0], [this.playersByPlayerId.get(player)!.entityId, ...action[1].slice(1)], action[2])
    }
    tick(): void {
        (this.sim.systems['clock'] as Clock).tick()
    }
    get t() {
        return (this.sim.systems['clock'] as Clock).t
    }
}
export default class Simulation implements ISimulation {
    static hierarchy = [
        ['clock', 'actionRequester', 'thingManager'],
        ['phys', 'scheduler'],
        ['container', 'electricity']
    ]
    static builders: Record<string, (deps: Record<string, System>)=>System> = {
        thingManager: (_)=> new ThingManager(),
        clock: (_)=> new Clock(),
        actionRequester: (_)=> new ActionRequester(),
        phys: (deps)=> new PhysicsSystem(deps),
        scheduler: (deps)=> new Scheduler(deps),
        container: (deps)=> new ContainerSystem(deps),
        electricity: (deps)=> new ProngSystem(deps),
    }
    /** do not construct directly with new Simulation(...). use Simulation.build() instead*/
    constructor(readonly systems: {[x: string]: System}, public onActionDone?: (data: {action: Action, terms: Entity[]})=>void, public onActionFailed?: (data: {action: Action, terms: (Entity | undefined)[], error: string})=>void) {
        const thingManager = (this.systems['thingManager'] as ThingManager)
        thingManager.make = this.make;
        thingManager.destroy = this.destroy;
        const requester = this.systems['actionRequester'] as ActionRequester
        requester.doAction = this.doAction;
    }
    doAction = (actionIota: number, ids: string[], vals?: Record<string, unknown>)=>{
        const action = Action.byIota(actionIota)!
        const terms = ids.map(x=>(this.systems['thingManager'] as ThingManager).entityById.get(x))
        if (terms.some(x=>x===undefined)) {
            this.onActionFailed?.({action, terms, error: 'missing entity'})
            return
        }
        const error = action.effect?.(this.systems)(terms as Entity[], vals)
        if (error===undefined) {
            this.onActionDone?.({action, terms: terms as Entity[]})
        }else {
            this.onActionFailed?.({action, terms: terms as Entity[], error})
        }
    }
    
    destroy = (entity: Entity)=>{
        for(const system in this.systems) {
            this.systems[system].cleanUpDestroyed?.(entity)
        }
        (this.systems['thingManager'] as ThingManager).entityById.delete(entity.id)
    }
    make = (thing: string)=>{
        const entity = entities[thing](this.systems, (this.systems['thingManager'] as ThingManager).bareEntity(1))
        entity.examinableComp = examinables[thing]
        entity.essence = thing
        return entity
    }
    static build() {
        const systems: {[x: string]: System} = {}
        for(const tier in Simulation.hierarchy) {
            for(const system of Simulation.hierarchy[tier]) {
                systems[system] = Simulation.builders[system](systems)
            }
        }
        return new Simulation(systems)
    }
    copy() {
        const systems: {[x: string]: System} = {}
        for(const tier in Simulation.hierarchy) {
            for(const system of Simulation.hierarchy[tier]) {
                systems[system] = this.systems[system].copy(systems)
            }
        }
        return new Simulation(systems)
    }
}