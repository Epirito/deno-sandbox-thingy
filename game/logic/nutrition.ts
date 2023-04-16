import { damage } from "./damageable.ts";
import { Entity } from "./entity.ts";
import { ActionRequester } from "./trivial-systems.ts";

export function feed(entity: Entity, amount: number) {
    if (!entity.nutritionComp) return
    entity.nutritionComp.nutrition += amount
    entity.nutritionComp.nutrition = Math.min(entity.nutritionComp.nutrition, entity.nutritionComp.maxNutrition)
}
export function hunger(actionRequester: ActionRequester, entity: Entity) {
    if (!entity.nutritionComp) return
    entity.nutritionComp.nutrition -= 1
    entity.nutritionComp.nutrition = Math.max(entity.nutritionComp.nutrition, 0)
    if (entity.nutritionComp.nutrition === 0) {
        damage(actionRequester, entity, 1)
    }
}