import { ProngedComponent, IProngedComponent } from "./prong.ts"
import { DamageableComponent } from "./damageable.ts";
import { ContainerComponent, HandComponent, CredentialComponent } from "./container.ts";
import { ExaminableComponent } from "./examinable.ts";
import { LightSourceComponent } from "./lighting.ts";
import { CraftingComponent } from "./crafting.ts";
import { SaturatedAction } from "./action.ts";
import { SignalQueueComponent } from "./mux.ts";
import { SpeedComponent } from "./speed-based-physics.ts";
import { IAgent } from "./ai.ts";
export class Entity implements IEntity {
    essence?: string; 
    useComp?: (user: Entity, hoverPos: [number, number] | undefined)=>SaturatedAction;
    interactComp?: (user: Entity, entity: Entity)=>SaturatedAction;
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
    readonly interactComp?: (user: Entity, entity: Entity)=>SaturatedAction;
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