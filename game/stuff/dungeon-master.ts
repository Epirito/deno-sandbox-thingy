import { walk } from "./actions.ts";
import { Entity } from "../logic/entity.ts";
import {SaturatedAction } from "../logic/action.ts";
import {SimulationWrapper } from "../logic/simulation.ts";
import { Dependencies, ISimulation, NPCSimulationPOV, PhysicsSystem } from "../mod.ts";
import { ThingManager } from "../logic/thing-manager.ts";
import { WORLDSIZE } from "../logic/constants.ts";
import{neighbors} from "../utils/vector.ts"
import { TerrainSystem } from "../logic/terrain.ts";
import { terrainSpecs } from "./terrain-specs.ts";
import { decay, make, setTile } from "./world-actions.ts";
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
    updateAt = (x: number, y: number, isSource: (point: [number, number])=>boolean)=> {
        const idx = y*WORLDSIZE+x
        if (isSource([x,y])) {
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
    updateAll(isSource: (point: [number, number])=>boolean) {
        for(let y = 0; y<WORLDSIZE; y++) {
            for(let x = 0; x<WORLDSIZE; x++) {
                this.updateAt(x, y, isSource)
            }
        }
        for(let y = WORLDSIZE-1; y>=0; y--) {
            for(let x = WORLDSIZE-1; x>=0; x--) {
                this.updateAt(x, y, isSource)
            }
        }
    }
    updateAround(source: [number, number]) {
        const isSource = ([x,y]: [number, number])=>y===source[1] && x===source[0]
        for(let y = source[1]-this.range; y<=source[1]+this.range; y++) {
            for(let x = source[0]-this.range; x<=source[0]+this.range; x++) {
                this.updateAt(x, y, isSource)
            }
        }
        for(let y = source[1]+this.range; y >= source[1]-this.range; y--) {
            for(let x = source[0]+this.range; x>=source[0]-this.range; x--) {
                this.updateAt(x, y, isSource)
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
const maxDecayCounter = 30
export class DungeonMaster {
    private flowSources: Record<string, Set<string>> = {}
    private flowFields: Record<string, FlowField> = {
        human: new FlowField(10),
        smallAnimal: new FlowField(10),
        predator: new FlowField(10),
    }
    private decayCounter = 0
    flowField = (name: string, pos: [number,number]) => {
        return this.flowFields[name].array[pos[1]*WORLDSIZE+pos[0]]
    }
    get systems() {
        return this.client.world.sim.systems as Dependencies
    }
    constructor(private client: DungeonMasterClient) {
        for(const field in this.flowFields) {
            this.flowSources[field] = new Set()
        }
    }
    
    longTermUpdate() {
        const pos = [Math.floor(Math.random() * WORLDSIZE), Math.floor(Math.random() * WORLDSIZE)] as [number,number];
        const tile = this.systems.terrain.get(pos)
        switch(tile) {
            case terrainSpecs.youngCrops:
                this.client.dmInput(setTile.from([], {pos, tileIota: terrainSpecs.crops.iota}))
            break
            case terrainSpecs.herb:
                this.client.dmInput(make.from([], {essence: 'rabbit', pos}))
            break
            case terrainSpecs.dirt:
                this.client.dmInput(setTile.from([], {pos, tileIota: terrainSpecs.herb.iota}))
        }
    }
    update() {
        this.decayCounter = (this.decayCounter+1)%maxDecayCounter
        this.longTermUpdate()
        for(const set in this.flowSources) {
            this.flowSources[set].clear()
        }
        (this.client.world.sim.systems['thingManager'] as ThingManager).entityById.forEach(npc=>{
            if ((this.client.world.sim.systems['phys'] as PhysicsSystem).position(npc)===undefined) {
                return
            }
            const npcPov = new NPCSimulationPOV(this.client.world.sim.systems, npc.id)
            /* old pathfinding which only updated around relevant entities
            if (npc.essence==='man') {
                this.flowFields.human.updateAround(npcPov.phys.position(npc)!)
            }
            */
            if (npc.flowFieldComp) {
                this.flowSources[npc.flowFieldComp].add(npcPov.phys.position(npc)!.join(','))
            }
            if (npc.agentComp) {    
                const action = npc.agentComp.getAction(npcPov, {flowField: this.flowField})
                if (action===null) {
                    return
                }
                if (action)
                this.client.dmInput([action[0], [npc.id, ...action[1]], action[2]])
            }
        })
        if (this.decayCounter===0) {
            this.systems.thingManager.entityById.forEach(entity=>this.client.dmInput(decay.from([entity])))
        }
        for(const field in this.flowFields) {
            this.flowFields[field].updateAll(([x,y])=>{
                return this.flowSources[field].has([x,y].join(','))
            })
        }
    }
}