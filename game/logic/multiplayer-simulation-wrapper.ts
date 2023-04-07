import { LockstepModel, Model } from "../../multiplayer/mod.ts";
import { System } from "../mod.ts";
import { Action, SaturatedAction } from "./action.ts";
import { Entity } from "./entity.ts";
import Simulation, { ISimulation } from "./simulation.ts";

export class MultiplayerWrapper implements ISimulation{
    set onActionDone(listener: (({ action,terms }: { action: Action; terms: Entity[]; }) => void)|undefined) {
        this.lockstep.model!.authoritative.onActionDone = listener
    }
    set onActionFailed(listener: (({ action,terms,error }: { action: Action; terms: (Entity|undefined)[]; error: string; }) => void)|undefined) {
        this.lockstep.model!.authoritative.onActionFailed = listener
    }
    doAction(actionIota: number,ids: string[],vals?: Record<string,unknown>|undefined) {
        this.lockstep.playerInput([actionIota, ids, vals??{}])
    }
    lockstep!: LockstepModel<SaturatedAction, Simulation>;
    constructor(initGame: (nPlayers: number)=>Simulation, render: (sim: Simulation)=>void, onStart: (initialState: Simulation)=>void) {
        this.lockstep = new LockstepModel(initGame, render, onStart, "ws://localhost:3000")
    }
    /**
        WARNING: this reference will change out from under you every time the prediction rolls back.
    */
    get systems() {
        return this.lockstep.model!.prediction.systems;
    }
}