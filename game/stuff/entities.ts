import { Entity } from "../logic/entity.ts";
import { PhysicsSystem } from "../logic/physics.ts";
import { ProngSystem, ProngedComponent } from "../logic/prong.ts";
import { lampSpec, inputSpec, wireSpec, bimuxSpec } from "./pronged-specs.ts";
import { CraftingComponent, Recipe } from "../logic/crafting.ts";
import { Scheduler } from "../logic/scheduler.ts";
import { onPlacedOnBelt, onPressureListenerPlaced, onPressureListenerUnplaced, pressurePlateDetection, schedule } from "./world-actions.ts";
import { System } from "../logic/simulation.ts";
import { examinables } from "../mod.ts";
import { ContainerComponent, HandComponent } from "../logic/container.ts";
export type EntityFactory = (dependencies: Record<string, unknown>, bare: Entity)=>Entity
export const entities: {[x: string]: (dep: Record<string, System>, bare: Entity)=>Entity} = {
    man: (_, bare: Entity)=> {
        const player = bare;
        player.examinableComp = examinables.man
        player.handComp = new HandComponent(5);
        player.blocksMovement = true;
        return player;
    },
    chest: (_, bare: Entity)=> {
        const chest = bare;
        chest.containerComp = new ContainerComponent(5);
        chest.examinableComp = examinables.chest
        chest.blocksMovement = true;
        return chest;
    },
    craftingTable: (_, bare: Entity)=> {
        const table = bare;
        const godRecipes: Recipe[] = []
        for(const entity in entities) {
            godRecipes.push(new Recipe(entity, []))
        }
        const godCraftingComp = new CraftingComponent(godRecipes)
        table.craftingComp = godCraftingComp
        table.blocksMovement = true;
        return table;
    },
    wire: (dependencies, bare)=> {
        const {electricity} = dependencies as {electricity: ProngSystem}
        const wire = bare;
        electricity.addEntity(wire);
        wire.prongedComp = new ProngedComponent(wireSpec(dependencies), wire);
        return wire;
    },
    belt: (dependencies, bare)=> {
        const {phys} = dependencies as {phys: PhysicsSystem, scheduler: Scheduler}
        const belt = bare;
        const listener = onPlacedOnBelt.from([belt], {})
        phys.onPlaced(belt, onPressureListenerPlaced.from([belt], {listener}))
        phys.onUnplaced(belt, onPressureListenerUnplaced.from([belt], {listener}))
        return belt;
    },
    pressurePlate: (dependencies, bare)=> {
        const {phys, electricity} = dependencies as {phys: PhysicsSystem, electricity: ProngSystem}
        const plate = bare;
        electricity.addEntity(plate);
        plate.prongedComp = new ProngedComponent(inputSpec(dependencies), plate);
        const listener = pressurePlateDetection.from([plate], {delay: 60})
        phys.onPlaced(plate, onPressureListenerPlaced.from([plate], {listener}))
        phys.onUnplaced(plate, schedule.from([], {action: onPressureListenerUnplaced.from([plate], {listener}), delay: 0}))
        return plate;
    },
    lamp: (dependencies, bare)=>{
        const {electricity} = dependencies as {electricity: ProngSystem};
        const lamp = bare;
        electricity.addEntity(lamp);
        lamp.prongedComp = new ProngedComponent(lampSpec(dependencies), lamp);
        return lamp;
    },
    bimux: (dependencies, bare)=>{
        const {electricity} = dependencies as {electricity: ProngSystem};
        const bimux = bare;
        electricity.addEntity(bimux);
        bimux.prongedComp = new ProngedComponent(bimuxSpec(dependencies), bimux);
        bimux.signalQueueComp = []
        return bimux;
    }
}