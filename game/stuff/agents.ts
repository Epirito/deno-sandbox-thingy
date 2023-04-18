import { walk } from "./actions.ts";
import { SimulationPOV } from "../logic/simulation-pov.ts";
import { ISimulation, ISimulationPOV, SaturatedAction } from "../mod.ts";
import { IAgent } from "../logic/ai.ts";
import { AsExpression } from "https://deno.land/x/ts_morph@17.0.1/ts_morph.js";
import { pointInRect, rotatedBy, scalarMult, sum } from "../utils/vector.ts";
import { FlowField } from "./dungeon-master.ts";
import { WORLDSIZE } from "../logic/constants.ts";


const ANGLEDELTA = .1
export class WanderAI implements IAgent {
    destination: [number, number] | undefined; angleFacing = 0;
    constructor(public spd: number) {}
    getAction(pov: ISimulationPOV) {
        /*the actual object position in the world is discrete, but the agent tracks
        a continuous position so that it can move in arbitrary directions and 
        not just eight*/
        const actualPos = pov.phys.position(pov.player!)!
        if (this.destination===undefined || this.destination.some((v, axis)=>Math.abs(v-actualPos[axis]) > 2)) {
            /*if the actual position has gone out of sync with the continuous 
            position, reinitialize the agent state*/
            this.destination = actualPos
            this.angleFacing = Math.random() * 2 * Math.PI
        }

        /*change position by moving towards angleFacing*/
        this.destination = sum(this.destination, scalarMult(this.spd, [Math.cos(this.angleFacing), Math.sin(this.angleFacing)]))
        
        /*randomly vary angleFacing*/
        this.angleFacing += (Math.random() - .5) * ANGLEDELTA % (2 * Math.PI)

        /*move towards x and y*/
        const movement = sum(this.destination, scalarMult(-1, actualPos));
        const direction = movement.map(x=>Math.floor(Math.abs(x)) * Math.sign(x)) as [number, number]
        if (direction[0]!==0 && direction[1]!==0) {
            // prevent diagonal movement
            direction[1] = 0
        }
        const rotation = [[1, 0], [0, 1], [-1, 0], [0, -1]].findIndex(([x, y])=>x===direction[0] && y===direction[1])
        if (rotation===-1) {
            return null
        }
        return walk.from([], {rotation})
    }
}

export class HuntAI implements IAgent {
    constructor(public flowFields: string[], public flee=false) {}
    getAction(pov: ISimulationPOV, dmCompute: {flowField: (field: string, pos: [number,number])=>number}): SaturatedAction | null {
        const pos = pov.phys.position(pov.player!)!
        function idx(pos: [number, number]) {return pos[0] + pos[1] * WORLDSIZE}
        const east = [1,0] as [number, number]
        const options: {rotation: number, value: number}[] = []
        const valueOfFieldDisjunction = (position: [number, number]) => {
            return Math.min(...this.flowFields.map(field=>dmCompute.flowField(field, position)))
        }
        for(let rotation = 0; rotation < 4; rotation++) {
            const vec = rotatedBy(east, rotation)
            const destination = sum(pos, vec)
            if (pointInRect(destination, [0,0], [WORLDSIZE, WORLDSIZE])) {
                const value = valueOfFieldDisjunction(destination)
                options.push({rotation, value})
            }
        }
        if (this.flee) {
            const bestOption = options.reduce((a, b)=>a.value > b.value ? a : b)
            if (bestOption.value > valueOfFieldDisjunction(pos)) {
                return walk.from([], {rotation: bestOption.rotation})
            }
        }else {
            const bestOption = options.reduce((a, b)=>a.value < b.value ? a : b)
            if (bestOption.value < valueOfFieldDisjunction(pos)) {
                return walk.from([], {rotation: bestOption.rotation})
            }
        }
        return null
    }
}
export function disjunction(agent0: IAgent, agent1: IAgent) {
    return {
        getAction(pov: ISimulationPOV, dmCompute: {flowField: (field: string, pos: [number,number])=>number}) {
            return agent0.getAction(pov, dmCompute) ?? agent1.getAction(pov, dmCompute)
        }
    } as IAgent
}