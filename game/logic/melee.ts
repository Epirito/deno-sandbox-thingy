import { Action, ActionRequester, Entity } from "../mod.ts";
import { terrainSpecs } from "../stuff/terrain-specs.ts";
import { setTile } from "../stuff/world-actions.ts";
import { ContainerSystem } from "./container.ts";
import { damage } from "./damageable.ts"
import { PhysicsSystem } from "./physics.ts";
import { TerrainSystem } from "./terrain.ts";
import { TerrainSpec } from "./terrain.ts";
export function poison(entity: Entity, amount: number) {
    if (!entity.bloodStreamComp) return
    entity.bloodStreamComp.poison += amount
}
function applyFlatMeleeDmg(actionRequester: ActionRequester, meleeData: FlatMeleeSpec, defender: Entity) {
    damage(actionRequester, defender, meleeData.dmg)
    if (meleeData.poisonAmount) {
        poison(defender, meleeData.poisonAmount)
    }
}
export const flatWeaponAttack = new Action(true, undefined, deps=>(terms, vals)=>{
    const {actionRequester} = deps as {actionRequester: ActionRequester}
    const [_attacker, weapon, defender] = terms
    applyFlatMeleeDmg(actionRequester, weapon.weaponData!, defender)
})
export const flatUnarmedAttack = new Action(true, undefined, deps=>(terms, vals)=>{
    const {actionRequester} = deps as {actionRequester: ActionRequester}
    const [attacker, defender] = terms
    applyFlatMeleeDmg(actionRequester, attacker.unarmedData!, defender)
})
export type FlatMeleeSpec = {dmg: number, poisonAmount?: number}
export type MeleeSpec = {dmg: number, poison?: number}

function attackWith(actionRequester: ActionRequester, attacker: Entity, weapon: Entity, defender: Entity) {
    actionRequester.doAction(...weapon.meleeWeaponAttack!.from([attacker, weapon, defender]))
}
export const meleeTouch = new Action(false, undefined, deps=>(terms, _)=>{
    const {actionRequester, container} = deps as {actionRequester: ActionRequester, container: ContainerSystem}
    const [attacker, defender] = terms
    const equipped = container.getEquipped(attacker)
    if (equipped?.meleeWeaponAttack) {
        attackWith(actionRequester, attacker, equipped, defender)
        return
    }
    if (attacker.unarmedAttack) {
        actionRequester.doAction(...attacker.unarmedAttack.from([attacker, defender]))
    }
})
export const eatTouch = new Action(false, undefined, deps=>(terms, _)=>{
    const {actionRequester, container} = deps as {actionRequester: ActionRequester, container: ContainerSystem}
    const [actor, food] = terms
    /* draft:
    if (actor.dietComp?.canEat(food)) {
        actionRequester.doAction(...container.tryEat(actor, food))
    }*/
})