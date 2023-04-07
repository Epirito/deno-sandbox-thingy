import { Clock } from "../logic/clock.ts";
import {ContainerSystem} from "../logic/container.ts";
import { PhysicsSystem } from "../logic/physics.ts";
import { ProngSystem } from "../logic/prong.ts";
import { Scheduler } from "../logic/scheduler.ts";
import Simulation from "../logic/simulation.ts";
import { trivialSystem } from "../logic/trivial-systems.ts";
import { ThingManager } from "../logic/thing-manager.ts";

export function emptySimulation() {
    const thingManager = new ThingManager()
    const actionRequester = trivialSystem()
    const clock = new Clock()
    const scheduler = new Scheduler({clock, actionRequester})
    const phys = new PhysicsSystem(actionRequester);
    const electricity = new ProngSystem({phys, scheduler});
    const container = new ContainerSystem({phys, thingManager});
    return new Simulation({phys, electricity, container, thingManager, actionRequester, clock, scheduler});
}
export function spawnPlayers(sim: Simulation, nPlayer: number, spawnPoint: [number, number]) {
    const playerIds = []
    for(let i = 0; i < nPlayer; i++) {
        const player = (sim.systems['thingManager'] as ThingManager).make!('man');
        playerIds.push(player.id);
        (sim.systems['phys'] as PhysicsSystem).place(player, {position: spawnPoint, rotation: 0});
    }
    return [sim, playerIds] as const;
}