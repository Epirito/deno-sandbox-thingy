import { LockstepModel } from "modularMultiplayer"
import { SimulationWrapper } from "../mod.ts";
import { SaturatedAction } from "./action.ts";
import { IContainerSystem } from "./container.ts";
import { IPhysicsSystem } from "./physics.ts";
import { IProngSystem } from "./prong.ts";
import { ThingManager } from "./thing-manager.ts";
export class SimulationPOV {
    
    constructor(private lockstep: LockstepModel<SaturatedAction, SimulationWrapper>, public playerId?: string) {
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