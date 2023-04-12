import { walk } from "./actions.ts";
import { Entity } from "../logic/entity.ts";
import {SaturatedAction } from "../logic/action.ts";
import {SimulationWrapper } from "../logic/simulation.ts";
import { ISimulation, NPCSimulationPOV } from "../mod.ts";
import { ThingManager } from "../logic/thing-manager.ts";
import { WORLDSIZE } from "../logic/constants.ts";
import{neighbors} from "../utils/vector.ts"
export interface DungeonMasterClient {
    get world(): SimulationWrapper;
    dmInput(action: SaturatedAction): void
}


const MAX = 100
export class FlowField {
    array = new Int8Array(WORLDSIZE**2)
    constructor(readonly range: number) {
        this.array.fill(MAX)
    }
    updateAround(source: [number, number]) {
        const updateAt = (x: number, y: number)=> {
            const idx = y*WORLDSIZE+x
            if (y===source[1] && x===source[0]) {
                this.array[idx] = 0
                return
            }
            
            const neighborValues = neighbors(idx).map(x=>this.array[x])
            const least = Math.min(...neighborValues)
            if (this.array[idx] < least) {
                this.array[idx] = least
            }else {
                this.array[idx] = Math.min(MAX, least+1)
            }
        }
        for(let y = source[1]-this.range; y<=source[1]+this.range; y++) {
            for(let x = source[0]-this.range; x<=source[0]+this.range; x++) {
                updateAt(x, y)
            }
        }
        for(let y = source[1]+this.range; y >= source[1]-this.range; y--) {
            for(let x = source[0]+this.range; x>=source[0]-this.range; x--) {
                updateAt(x, y)
            }
        }
    }
}
export class SingleplayerDungeonMasterClient implements DungeonMasterClient {
    constructor(private sim: SimulationWrapper) {}
    get world() {
        return this.sim
    }
    dmInput(action: SaturatedAction): void {
        this.sim.sim.doAction(...action)
    }
}
export class DungeonMaster {
    huntingFlowField = new FlowField(10)
    constructor(private client: DungeonMasterClient) {
    }
    update() {
        (this.client.world.sim.systems['thingManager'] as ThingManager).entityById.forEach(npc=>{
            
            const npcPov = new NPCSimulationPOV(this.client.world.sim.systems, npc.id)
            if (npc.essence==='man') {
                this.huntingFlowField.updateAround(npcPov.phys.position(npc)!)
            }
            if (!npc.agentComp) {
                return
            }
            const action = npc.agentComp.getAction(npcPov, {flowField: this.huntingFlowField})
            if (action===null) {
                return
            }
            if (action)
            this.client.dmInput([action[0], [npc.id, ...action[1]], action[2]])
        })
    }
}