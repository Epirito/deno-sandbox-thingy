import { ProngedComponent, IProngedComponent } from "./prong.ts"
import { DamageableComponent } from "./damageable.ts";
import { ContainerComponent, HandComponent, CredentialComponent } from "./container.ts";
import { ExaminableComponent } from "./examinable.ts";
import { LightSourceComponent } from "./lighting.ts";
import { CraftingComponent } from "./crafting.ts";
import { Action, SaturatedAction } from "./action.ts";
import { SignalQueueComponent } from "./mux.ts";
import { SpeedComponent } from "./speed-based-physics.ts";
import { IAgent } from "./ai.ts";
import { System } from "../mod.ts";
import { FlatMeleeSpec } from "./melee.ts";
export class Entity implements IEntity {
    essence?: string; 
    useComp?: Action;
    interactComp?: Action;
    damageableComp?: DamageableComponent;
    examinableComp?: ExaminableComponent;
    prongedComp?: ProngedComponent;
    sustainedDmgComp?: DamageableComponent;
    handComp?: HandComponent;
    containerComp?: ContainerComponent;
    credentialComp?: CredentialComponent;
    lightSourceComp?: LightSourceComponent;
    craftingComp?: CraftingComponent;
    timeOut?: SaturatedAction;
    signalQueueComp?: SignalQueueComponent
    speedComp?: SpeedComponent
    agentComp?: IAgent
    touchComp?: Action
    flowFieldComp?: string
    unarmedAttack?: Action
    meleeWeaponAttack?: Action
    bloodStreamComp?: {poison: number}
    weaponData?: FlatMeleeSpec
    unarmedData?: FlatMeleeSpec
    moveRecoveryComp?: {baseRecovery: number, inRecovery: boolean}
    nutritionComp?: {nutrition: number, maxNutrition: number}
    constructor(readonly id: string, public size: number, public blocksMovement = false) {
    }
    copy() {
      throw new Error("incomplete implementation")
      const newEntity = new Entity(this.id, this.size, this.blocksMovement)
      newEntity.essence = this.essence
      newEntity.examinableComp = this.examinableComp
      newEntity.handComp = this.handComp
      newEntity.containerComp = this.containerComp
      newEntity.lightSourceComp = this.lightSourceComp
      newEntity.craftingComp = this.craftingComp
      newEntity.prongedComp = this.prongedComp?.copy(newEntity)
      return newEntity
    }
  }
export interface IEntity {
    readonly interactComp?: Action;
    readonly essence?: string;
    readonly id: string;
    readonly size: number;
    readonly blocksMovement: boolean;
    readonly examinableComp?: ExaminableComponent;
    readonly prongedComp?: IProngedComponent;
    readonly handComp?: HandComponent;
    readonly containerComp?: ContainerComponent;
    readonly credentialComp?: CredentialComponent;
    readonly lightSourceComp?: LightSourceComponent;
    readonly craftingComp?: CraftingComponent
    readonly damageableComp?: DamageableComponent
}