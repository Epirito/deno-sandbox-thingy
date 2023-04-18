import { Entity } from "../logic/entity.ts";
import { PhysicsSystem } from "../logic/physics.ts";
import { ProngSystem, ProngedComponent } from "../logic/prong.ts";
import { lampSpec, inputSpec, wireSpec, bimuxSpec } from "./pronged-specs.ts";
import { CraftingComponent, Recipe } from "../logic/crafting.ts";
import { Scheduler } from "../logic/scheduler.ts";
import { collision, eatGrass, enter, onPlacedOnBelt, onPressureListenerPlaced, onPressureListenerUnplaced, pressurePlateDetection, schedule } from "./world-actions.ts";
import { System } from "../logic/simulation.ts";
import { axeCutAction, eat, emitProjectileTo, examinables, pickStrikeAction } from "../mod.ts";
import { ContainerComponent, HandComponent } from "../logic/container.ts";
import { drive, } from "./actions.ts";
import { SpeedComponent } from "../logic/speed-based-physics.ts";
import { HuntAI, WanderAI, disjunction } from "./agents.ts";
import { touchSpike } from "./world-gen.ts";
import { flatUnarmedAttack, meleeTouch } from "../logic/melee.ts";
export type EntityFactory = (dependencies: Record<string, unknown>, bare: Entity)=>Entity
const basicEntity: EntityFactory = (_, bare: Entity)=>{
    bare.size = 2;
    return bare
}
export const entities: {[x: string]: (dep: Record<string, System>, bare: Entity)=>Entity} = {
    apple: (_, bare: Entity)=> {
        bare.size = 2;
        bare.useComp = eat;
        return bare
    },
    coal: basicEntity,
    iron: basicEntity,
    zombie: (_, bare: Entity)=> {
        bare.size = 6;
        bare.damageableComp = {integrity: 20, total: 20}
        bare.blocksMovement = true;
        bare.unarmedData = {dmg: 2}
        bare.unarmedAttack = flatUnarmedAttack;
        bare.touchComp = meleeTouch;
        bare.agentComp = new HuntAI(['human']);
        return bare;
    },
    rabbit: (deps, bare: Entity)=> {
        const {phys} = deps as {phys: PhysicsSystem}
        bare.size = 2;
        bare.flowFieldComp = 'smallAnimal'
        bare.nutritionComp = {nutrition: 10, maxNutrition: 20}
        bare.damageableComp = {integrity: 4, total: 4}
        bare.blocksMovement = true;
        bare.agentComp = disjunction(new HuntAI(['human', 'predator'], true), new WanderAI(0.5))
        phys.onPlaced(bare, eatGrass.from([bare]))
        return bare
    },
    chicken: (_, bare: Entity)=> {
        bare.size = 3;
        bare.flowFieldComp = 'smallAnimal'
        bare.damageableComp = {integrity: 4, total: 4}
        bare.blocksMovement = true;
        bare.agentComp = new HuntAI(['predator'], true);
        return bare
    },
    wolf: (_, bare: Entity)=> {
        bare.size = 4;
        bare.flowFieldComp = 'predator'
        bare.damageableComp = {integrity: 10, total: 10}
        bare.blocksMovement = true;
        bare.unarmedData = {dmg: 4}
        bare.unarmedAttack = flatUnarmedAttack;
        bare.touchComp = meleeTouch;
        bare.agentComp = new HuntAI(['smallAnimal']);
        return bare
    },
    cactus: (_, bare: Entity)=> {
        bare.size = 4;
        bare.touchComp = touchSpike;
        return bare
    },
    man: (_, bare: Entity)=> {
        bare.size = 6;
        bare.flowFieldComp = 'human';
        bare.handComp = new HandComponent(5);
        bare.damageableComp = {integrity: 20, total: 20}
        bare.blocksMovement = true;
        bare.unarmedData = {dmg: 2}
        bare.unarmedAttack = flatUnarmedAttack;
        bare.touchComp = meleeTouch
        bare.moveRecoveryComp = {baseRecovery: 10, inRecovery: false}
        return bare;
    },
    gun: (_, bare: Entity)=> {
        const gun = bare;
        gun.useComp = emitProjectileTo;
        return gun;
    },
    axe: (_, bare: Entity)=> {
        //bare.useComp = axeCut;
        return bare;
    },
    pick: (_, bare: Entity)=> {
        bare.useComp = pickStrikeAction
        bare.weaponData = {dmg: 2}
        return bare
    },
    car: (_, bare: Entity)=> {
        bare.size = 30;
        bare.blocksMovement = true;
        bare.damageableComp = {integrity: 100, total: 100}
        bare.speedComp = new SpeedComponent((hitPos: [number, number], axis: 0|1)=>collision.from([bare], {hitPos, axis}))
        bare.containerComp = new ContainerComponent(1);
        bare.interactComp = enter;
        return bare;
    },
    chest: (_, bare: Entity)=> {
        const chest = bare;
        chest.containerComp = new ContainerComponent(5);
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