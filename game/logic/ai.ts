import { SaturatedAction } from "./action.ts";
import { ISimulationPOV, SimulationPOV } from "./simulation-pov.ts";
import { ISimulation } from "./simulation.ts";

export interface IAgent {
    getAction(pov: ISimulationPOV, dmCompute: any): SaturatedAction | null
}