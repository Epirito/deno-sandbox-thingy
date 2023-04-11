import { PhysicsSystem } from "../logic/physics.ts";
import Simulation from "../logic/simulation.ts";
import { ThingManager } from "../logic/thing-manager.ts";

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
    const {phys} = sim.systems as {phys: PhysicsSystem};
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
    phys.place(sim.make('gun'), { position: [5, 3], rotation: 0 })
    phys.place(sim.make('belt'), { position: [1, 1], rotation: 0 });
    phys.place(sim.make('belt'), { position: [2, 1], rotation: 0 });
    return sim
}