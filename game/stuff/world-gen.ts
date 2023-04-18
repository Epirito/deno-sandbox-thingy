import { WORLDSIZE } from "../logic/constants.ts";
import { damage } from "../logic/damageable.ts";
import { PhysicsSystem } from "../logic/physics.ts";
import Simulation from "../logic/simulation.ts";
import { TerrainSystem } from "../logic/terrain.ts";
import { ThingManager } from "../logic/thing-manager.ts";
import { Action, ActionRequester } from "../mod.ts";
import { rectOutline } from "../utils/vector.ts";
import { terrainSpecs } from "./terrain-specs.ts";
import Noise from "noise"

export function spawnPlayers(sim: Simulation, nPlayer: number) {
    /* search for a suitable spawn point around the middle. Deep water is not suitable. */
    const getSpawnPoint = ()=>{
        const middle = Math.floor(WORLDSIZE/2)
        for(let i = 0; i < middle; i++) {
            const rect = rectOutline([middle - i, middle - i], [middle + i, middle + i])
            for(const pos of rect) {
                const terrain = (sim.systems['terrain'] as TerrainSystem).get(pos)
                if(terrain !== terrainSpecs.deepWater) {
                    return pos
                }
            }
        }
    }
    const spawnPoint = getSpawnPoint()
    const thingManager = sim.systems['thingManager'] as ThingManager
    const phys = sim.systems['phys'] as PhysicsSystem
    phys.place(thingManager.make!('craftingTable'), {position: spawnPoint, rotation: 0})
    const playerIds = []
    for(let i = 0; i < nPlayer; i++) {
        const player = (sim.systems['thingManager'] as ThingManager).make!('man');
        playerIds.push(player.id);
        (sim.systems['phys'] as PhysicsSystem).place(player, {position: spawnPoint, rotation: 0});
    }
    return [sim, playerIds] as const;
}
function scaledUpNoise(scale: number) {
    const noise = new Noise.Simplex()
    return (x: number, y: number) => noise.get(x/scale, y/scale)
}
function continentalHeightMap() {
    const noise = scaledUpNoise(350)
    const heightMap: number[][] = []
    for(let y = 0; y < WORLDSIZE; y++) {
        heightMap.push([])
        for(let x = 0; x < WORLDSIZE; x++) {
            const value = noise(x, y)
            heightMap[y].push(value)
        }
    }
    return heightMap
}
function finalHeightMap() {
    const result = continentalHeightMap()
    const continental2 = scaledUpNoise(130)
    const puddles = scaledUpNoise(40)
    for(let y = 0; y < WORLDSIZE; y++) {
        for(let x = 0; x < WORLDSIZE; x++) {
            result[y][x] = Math.min(.6, result[y][x]*.6 + puddles(x, y)*.2) + continental2(x, y)*.2
        }
    }
    return result
}
const DEEPWATER = -.2
const WATER = .1
const SAND = .2
const GRASS = .3
const PALMTREE = .3
const DIRT = .6
export function noiseTerrain(sim: Simulation) {
    const heightMap = finalHeightMap()
    const {phys,terrain} = sim.systems as {phys: PhysicsSystem, terrain: TerrainSystem};
    for(let y = 0; y < WORLDSIZE; y++) {
        for(let x = 0; x < WORLDSIZE; x++) {
            const height = heightMap[y][x]
            const waterLessThan = DEEPWATER + (1-DEEPWATER) * WATER
            const sandGreaterThan = waterLessThan
            const sandLessThan = waterLessThan + (1-waterLessThan)*SAND
            const grassLessThan = sandLessThan + (1-sandLessThan)*GRASS
            const grassGreaterThan = sandLessThan
            const dirtLessThan = grassLessThan + (1-grassLessThan)*DIRT
            const dirtGreaterThan = grassLessThan
            if (height<DEEPWATER) {
                terrain.set([x,y], terrainSpecs.deepWater)
            }else if (height<waterLessThan) {
                terrain.set([x,y], terrainSpecs.shallowWater)
            }else if (height<sandLessThan) {
                const normalized = (height - sandGreaterThan) / (sandLessThan - sandGreaterThan)
                if (normalized > 1-PALMTREE && Math.random() < PALMTREE) {
                    terrain.set([x,y], terrainSpecs.palmTree)
                }else {
                    terrain.set([x,y], terrainSpecs.sand)
                }
            }else if (height<grassLessThan) {
                const normalized = (height-grassGreaterThan)/(grassLessThan-grassGreaterThan)
                if (Math.random() < normalized) {
                    terrain.set([x,y], terrainSpecs.herb)
                }
            }else if (height>dirtLessThan) {
                console.log('snow')
                terrain.set([x,y], terrainSpecs.snow)
            }
        }
    }
    return sim
}
export function debugWorld(sim: Simulation) {
    const {phys,terrain} = sim.systems as {phys: PhysicsSystem, terrain: TerrainSystem};
    sim = noiseTerrain(sim)
    /*for(let y = 0; y < 50; y++) {
        for(let x = 0; x < 50; x++) {
            terrain.set([x,y], terrainSpecs.herb)
        }
    }*/
    terrain.set([0,0], terrainSpecs.coalOre)
    terrain.set([1,0], terrainSpecs.coalOre)
    phys.place(sim.make('craftingTable'), { position: [5, 6], rotation: 0 })
    phys.place(sim.make('chest'), { position: [1, 0], rotation: 0 });
    phys.place(sim.make('pressurePlate'), { position: [1, 3], rotation: 0 });
    phys.place(sim.make('wire'), { position: [3, 3], rotation: 0 });
    phys.place(sim.make('wire'), { position: [2, 3], rotation: 0 });
    phys.place(sim.make('wire'), { position: [2, 2], rotation: 0 });
    phys.place(sim.make('bimux'), { position: [3, 2], rotation: 0 });
    phys.place(sim.make('wire'), { position: [4, 2], rotation: 0 });
    phys.place(sim.make('wire'), { position: [5, 2], rotation: 0 });
    phys.place(sim.make('bimux'), { position: [6, 2], rotation: 2 });
    phys.place(sim.make('lamp'), { position: [7, 2], rotation: 0 });
    phys.place(sim.make('lamp'), { position: [6, 1], rotation: 0 });
    phys.place(sim.make('car'), { position: [6, 3], rotation: 0 });
    phys.place(sim.make('pick'), { position: [7, 3], rotation: 0 });
    phys.place(sim.make('gun'), { position: [5, 3], rotation: 0 })
    phys.place(sim.make('belt'), { position: [1, 1], rotation: 0 });
    phys.place(sim.make('belt'), { position: [2, 1], rotation: 0 });
    phys.place(sim.make('zombie'), { position: [1, 5], rotation: 0 });
    phys.place(sim.make('cactus'), { position: [8, 8], rotation: 0 });
    phys.place(sim.make('rabbit'), { position: [8, 9], rotation: 0 });
    phys.place(sim.make('wolf'), { position: [8, 15], rotation: 0 });
    phys.place(sim.make('chicken'), { position: [9, 9], rotation: 0 });
    phys.place(sim.make('apple'), { position: [8, 10], rotation: 0 });
    return sim
}
const SPIKEDMG = 2
export const touchSpike = new Action(true,undefined, deps => (terms, _) => {
    const {actionRequester} = deps as {actionRequester: ActionRequester}
    const [_spiked, entity, entity2] = terms
    damage(actionRequester, entity, SPIKEDMG)
})