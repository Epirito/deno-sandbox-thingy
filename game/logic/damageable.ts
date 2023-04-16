import { Entity } from "../mod.ts";
import { destroy } from "../stuff/world-actions.ts";
import { Scheduler } from "./scheduler.ts";
import { ThingManager } from "./thing-manager.ts";
import { ActionRequester } from "./trivial-systems.ts";

export type DamageableComponent = {
  integrity: number,
  total: number
}
export function heal(entity: Entity, amt: number) {
  if (!entity.damageableComp) return;
  entity.damageableComp.integrity += amt;
  if(entity.damageableComp!.integrity > entity.damageableComp!.total) {
    entity.damageableComp!.integrity = entity.damageableComp!.total;
  }
}
export function damage(requester: ActionRequester, entity: Entity, dmg: number) {
  if (!entity.damageableComp) return;
  
  entity.damageableComp.integrity -= dmg;
  if(entity.damageableComp!.integrity <= 0) {
    requester.doAction!(...destroy.from([entity], {}))
  }
}