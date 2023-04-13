import {Client} from "modularMultiplayer"
import { IEntity, SimulationWrapper, System } from "../mod.ts";
import { SaturatedAction } from "./action.ts";
import { IContainerSystem } from "./container.ts";
import { IPhysicsSystem } from "./physics.ts";
import { IProngSystem } from "./prong.ts";
import { ThingManager } from "./thing-manager.ts";
import { ActionRequester } from "./trivial-systems.ts";
import { TerrainSpec, TerrainSystem } from "./terrain.ts";
export interface ISimulationPOV {
    get phys(): IPhysicsSystem;
    get electricity(): IProngSystem;
    get container(): IContainerSystem;
    get player(): IEntity | undefined;
}
export class NPCSimulationPOV implements ISimulationPOV{
    constructor(private dependencies: Record<string, System>, readonly entityId: string) {
    }
    get player() {
        return (this.dependencies['thingManager'] as ThingManager).byId(this.entityId)
    }
    get phys(): IPhysicsSystem {
        return (this.dependencies['phys'] as IPhysicsSystem)
    }
    get container(): IContainerSystem {
        return (this.dependencies['container'] as IContainerSystem)
    }
    get electricity(): IProngSystem {
        return (this.dependencies['electricity'] as IProngSystem)
    }
}
export class SimulationPOV implements ISimulationPOV{
    
    constructor(private lockstep: Client<SaturatedAction, SimulationWrapper>, public playerId?: string) {
    }
    get terrain(): TerrainSystem {
        return (this.lockstep.renderable.sim.systems['terrain'] as TerrainSystem)
    }
    get phys(): IPhysicsSystem {
        return (this.lockstep.renderable.sim.systems['phys'] as IPhysicsSystem)
    }
    get electricity(): IProngSystem {
        return (this.lockstep.renderable.sim.systems['electricity'] as IProngSystem)
    }
    get container(): IContainerSystem {
        return (this.lockstep.renderable.sim.systems['container'] as IContainerSystem)
    }
    get player() {
        return (this.lockstep.renderable.sim.systems['thingManager'] as ThingManager)
            .byId(this.lockstep.renderable.playerById(this.lockstep.player!)!.entityId)
    }
    get openContainer() {
        return this.lockstep.renderable.playerById(this.lockstep.player!)!.openContainer
    }
    get listFront() {
        return this.lockstep.renderable.playerById(this.lockstep.player!)!.listFront
    }
    playerAction(actionIota: number, ids: string[], vals?: Record<string, unknown>) {
        this.lockstep.playerInput([actionIota, [this.player!.id, ...ids], vals??{}])
    }
}