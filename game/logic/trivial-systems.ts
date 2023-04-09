import { ConstructorDeclaration } from "https://deno.land/x/ts_morph@17.0.1/ts_morph.js";
import random from "../utils/random.ts";
import { Entity } from "./entity.ts";
import Simulation, { System } from "./simulation.ts";
import { SaturatedAction } from "./action.ts";

export class ActionRequester implements System {
    doAction = (_actionIota: number, _termIds: string[], _vals?: Record<string, unknown>): void=>{
        throw new Error('ActionRequester.doAction not set')
    }
    copy() {
        return new ActionRequester()
    }
}