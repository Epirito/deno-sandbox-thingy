import random from "../utils/random.ts";
import { Entity } from "./entity.ts";
import Simulation, { System } from "./simulation.ts";

export function trivialSystem(): System {
    return {
        copy: trivialSystem
    }
}
export interface ActionRequester extends System {
    doAction?(actionIota: number, termIds: string[], vals?: Record<string, unknown>): void;
}