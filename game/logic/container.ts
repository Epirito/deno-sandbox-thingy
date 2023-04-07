import MultiMap from "../utils/multi-map.ts";
import { Entity, IEntity } from "./entity.ts";
import {PhysicsSystem} from "./physics.ts";
import { System } from "./simulation.ts";
import { ThingManager } from "./thing-manager.ts";

export class HandComponent {
  constructor(readonly capacity: number) {}
}
export class CredentialComponent {}
export class ContainerComponent {
  constructor(readonly capacity: number, readonly keyCanOpen?: (key: CredentialComponent)=>boolean) {}
}
export interface IContainerSystem extends System {
  getEquipped(actor: IEntity): IEntity | undefined;
  contents(container: IEntity): IEntity[];
}
export class ContainerSystem implements IContainerSystem {
  private containedByContainer: MultiMap<Entity, Entity> = new MultiMap();
  private equippedByEntity: Map<Entity, Entity> = new Map();
  phys: PhysicsSystem
  thingManager: ThingManager
  constructor(private dependencies: Record<string, unknown>) {
    this.phys = dependencies['phys'] as PhysicsSystem;
    this.thingManager = dependencies['thingManager'] as ThingManager;
  }
  placeInside(container: Entity, item: Entity) {
    this.containedByContainer.set(container, item);
  }
  tryPickUp(actor: Entity, item: Entity) {
    if (this.getEquipped(actor)) {
      return 'already holding something'
    }
    this.phys.unplace(item);
    this.equippedByEntity.set(actor, item);
  }
  tryInsertInto(actor: Entity, into: Entity) {
    const item = this.getEquipped(actor);
    if (!item) {
      return 'not holding item'
    }
    if (this.containedByContainer.get(into)?.length === into.containerComp?.capacity) {
      return 'container full'
    }
    this.equippedByEntity.delete(actor);
    this.containedByContainer.set(into, item);
  }
  enter(actor: Entity, container: Entity) {
    this.phys.unplace(actor);
    this.containedByContainer.set(container, actor);
  }
  tryWithdraw(actor: Entity, item: Entity, container: Entity) {
    if (this.getEquipped(actor)) {
      return 'already holding something'
    }
    this.containedByContainer.remove(container, item);
    this.equippedByEntity.set(actor, item);  
  }
  tryCraft(_: Entity, option: number, table: Entity) {
    const recipe = table.craftingComp!.recipes[option]
    const remainingInputs = [...recipe.inputs]
    const foundInputs: Entity[] = []
    const position = this.phys.position(table)!
    while(remainingInputs.length>0) {
      const [count, input] = remainingInputs.pop()!;
      const items = this.phys.entitiesAt(position).filter((item) => item.essence === input);
      if (items.length < count) {
        return 'not enough ingredients'
      }
      foundInputs.concat(items.slice(0,count))
    }
    foundInputs.forEach((item) => {
      this.thingManager.destroy!(item);
    });
    this.phys.place(this.thingManager.make!(recipe.output), {position, rotation: 0})
  }
  spill(container: Entity) {
    this.containedByContainer.get(container)?.forEach((item) => {
      this.phys.place(item,{position: this.phys.position(container)!, rotation: 0});
    });
    this.containedByContainer.delete(container);
  }
  tryDrop(actor: Entity) {
    const item = this.equippedByEntity.get(actor);
    if (!item) {
      return 'not holding item'
    }
    this.phys.place(item,{position: this.phys.position(actor)!, rotation: this.phys.rotation(actor)!});
    this.equippedByEntity.delete(actor);
  }
  cleanUpDestroyed(entity: Entity) {
    this.tryDrop(entity);
    this.spill(entity);
  }
  getEquipped(actor: Entity) {
    return this.equippedByEntity.get(actor);
  }
  contents(container: Entity) {
    return this.containedByContainer.get(container);
  }
  copy(dependencies: Record<string, System>) {
    const thingManager = dependencies['thingManager'] as ThingManager;
    const copy = new ContainerSystem(dependencies);
    this.containedByContainer.forEach((items, container) => {
      items.forEach((item) => {
        copy.containedByContainer.set(thingManager.byId(container.id)!, thingManager.byId(item.id)!);
      })
    });
    this.equippedByEntity.forEach((item, actor) => {
      copy.equippedByEntity.set(thingManager.byId(actor.id)!, thingManager.byId(item.id)!);
    });
    return copy;
  }
}

export function canPickUp(actor: Entity, item: Entity) {
  return actor.handComp && actor.handComp.capacity>=item.size
}

export function canInsertInto(item: Entity, container: Entity) {
  return container.containerComp && container.containerComp.capacity>=item.size
}

export function canOpen(actor: Entity, container: Entity) {
  return !container.containerComp!.keyCanOpen || actor.credentialComp && container.containerComp!.keyCanOpen(actor.credentialComp)
}