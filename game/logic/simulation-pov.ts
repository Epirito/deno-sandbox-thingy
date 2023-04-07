import { open } from "../stuff/actions.ts";
import { IContainerSystem } from "./container.ts";
import { Entity } from "./entity.ts";
import { IPhysicsSystem } from "./physics.ts";
import { IProngSystem } from "./prong.ts";
import {ISimulation} from "./simulation.ts";
import { ThingManager } from "./thing-manager.ts";
export class SimulationPOV {
    listFront = false;
    openContainer?: Entity;
    constructor(private sim: ISimulation, public playerId?: string) {
        this.sim.onActionDone = ({action, terms}) => {
            this.listFront = false;
            if (action===open) {
                this.openContainer = terms[1]
            }else {
                this.openContainer = undefined
            }
            if (action.verb) {
                console.log(action.verb(terms.map(x=>x.examinableComp?.examine(this.player, x)[0] || "???")));
            }
        }
        this.sim.onActionFailed = ({action, terms, error}) => {
            if (error==='blocked') {
                this.listFront = true;
            }
            console.log(action, terms, error);
        }
    }
    get phys(): IPhysicsSystem {
        return (this.sim.systems['phys'] as IPhysicsSystem)
    }
    get electricity(): IProngSystem {
        return (this.sim.systems['electricity'] as IProngSystem)
    }
    get container(): IContainerSystem {
        return (this.sim.systems['container'] as IContainerSystem)
    }
    get player() {
        return (this.sim.systems['thingManager'] as ThingManager).byId(this.playerId!)
    }
    playerAction(actionIota: number, ids: string[], vals?: Record<string, unknown>) {
        this.sim.doAction(actionIota, [this.playerId!, ...ids], vals)
    }
}