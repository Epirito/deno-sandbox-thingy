import { damage } from "../logic/damageable.ts";
import { PhysicsSystem } from "../logic/physics.ts";
import Simulation from "../logic/simulation.ts";
import { TerrainSystem } from "../logic/terrain.ts";
import { ThingManager } from "../logic/thing-manager.ts";
import { Action, ActionRequester } from "../mod.ts";
import { terrainSpecs } from "./terrain-specs.ts";

export function spawnPlayers(sim: Simulation, nPlayer: number, spawnPoint: [number, number]) {
    const playerIds = []
    for(let i = 0; i < nPlayer; i++) {
        const player = (sim.systems['thingManager'] as ThingManager).make!('man');
        playerIds.push(player.id);
        (sim.systems['phys'] as PhysicsSystem).place(player, {position: spawnPoint, rotation: 0});
    }
    return [sim, playerIds] as const;
}
export function debugWorld(sim: Simulation) {
    const {phys,terrain} = sim.systems as {phys: PhysicsSystem, terrain: TerrainSystem};
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
    return sim
}
const SPIKEDMG = 2
export const touchSpike = new Action(true,undefined, deps => (terms, _) => {
    const {actionRequester} = deps as {actionRequester: ActionRequester}
    const [_spiked, entity] = terms
    damage(actionRequester, entity, SPIKEDMG)
})