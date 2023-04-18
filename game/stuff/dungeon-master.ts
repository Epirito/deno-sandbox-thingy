import { walk } from "./actions.ts";
import { Entity } from "../logic/entity.ts";
import {SaturatedAction } from "../logic/action.ts";
import {SimulationWrapper } from "../logic/simulation.ts";
import { Dependencies, ISimulation, NPCSimulationPOV, PhysicsSystem } from "../mod.ts";
import { ThingManager } from "../logic/thing-manager.ts";
import { WORLDSIZE } from "../logic/constants.ts";
import{hash, neighbors, rectOutline, sum} from "../utils/vector.ts"
import { TerrainSystem } from "../logic/terrain.ts";
import { terrainSpecs } from "./terrain-specs.ts";
import { decay, make, setTile } from "./world-actions.ts";
export interface DungeonMasterClient {
    get world(): SimulationWrapper;
    dmInput(action: SaturatedAction): void
}

const CHUNKFACTOR = 20
const chunkSize = WORLDSIZE/CHUNKFACTOR
if (chunkSize!==Math.floor(chunkSize)) {
    throw new Error('chunkSize must be an integer')
}
const MAX = 100
export class FlowField {
    array = new Int8Array(WORLDSIZE**2)
    constructor(readonly range: number) {
        this.array.fill(MAX)
    }
    updateAt = (x: number, y: number, isSource: (point: [number, number])=>boolean, cost: (point: [number, number])=>number)=> {
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
            this.array[idx] = Math.min(MAX, least+cost([x,y]))
        }
    }
    updateRect(pos1: [number, number], pos2:[number,number], 
        isSource: (point: [number, number])=>boolean, cost: (point: [number, number])=>number) {
        for(let y = pos1[1]; y<pos2[1]; y++) {
            for(let x = pos1[0]; x<pos2[0]; x++) {
                this.updateAt(x, y, isSource, cost)
            }
        }
        for(let y = pos2[1]-1; y>=pos1[1]; y--) {
            for(let x = pos2[0]-1; x>=pos1[0]; x--) {
                this.updateAt(x, y, isSource, cost)
            }
        }
    }
    updateAll(isSource: (point: [number, number])=>boolean, cost: (point: [number, number])=>number) {
        this.updateRect([0,0], [WORLDSIZE, WORLDSIZE], isSource, cost)
        /*
        for(let y = 0; y<WORLDSIZE; y++) {
            for(let x = 0; x<WORLDSIZE; x++) {
                this.updateAt(x, y, isSource, cost)
            }
        }
        for(let y = WORLDSIZE-1; y>=0; y--) {
            for(let x = WORLDSIZE-1; x>=0; x--) {
                this.updateAt(x, y, isSource, cost)
            }
        }
        */
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
    defaultCost = (point: [number, number]) => {
        const tile = this.systems.terrain.get(point)
        return tile.blocksMovement || tile === terrainSpecs.deepWater ? MAX : 1
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
            case terrainSpecs.herb: {
                const rng = Math.random()
                if (rng<.1) {
                    this.client.dmInput(make.from([], {essence: 'rabbit', pos}))
                }else if (rng<.12) {
                    this.client.dmInput(make.from([], {essence: 'wolf', pos}))
                }
            }
            break
            case terrainSpecs.dirt:
                this.client.dmInput(setTile.from([], {pos, tileIota: terrainSpecs.herb.iota}))
        }
    }
    getActiveChunks() {
        const chunks = new Set<string>()
        const result: [number,number][] = []
        const addChunk = (chunkPos: [number, number])=> {
            const chunkHash = hash(chunkPos)
            if (!chunks.has(chunkHash)) {
                chunks.add(chunkHash)
                result.push(chunkPos)
            }
        }
        this.client.world.forEachPlayer(playerData=>{
            const entity = this.systems.thingManager.byId(playerData.entityId)
            const pos = this.systems.phys.position(entity!)!
            const chunkPos = pos.map(value=>Math.floor(value/chunkSize)) as [number, number]
            addChunk(chunkPos)
            const adjacent = rectOutline(sum(chunkPos, [-1,-1]), sum(chunkPos, [1,1]))
            adjacent.forEach(addChunk)
        })
        return result
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
        this.getActiveChunks().forEach(([chunkX,chunkY])=>{
            const pos1 = [chunkX*chunkSize, chunkY*chunkSize] as [number, number]
            const pos2 = [pos1[0]+chunkSize, pos1[1]+chunkSize] as [number, number]
            for(const field in this.flowFields) {
                const isSource = (pos: [number,number])=>{
                    return this.flowSources[field].has(hash(pos))
                }
                this.flowFields[field].updateRect(pos1, pos2, isSource, this.defaultCost)
            }
        })
    }
}