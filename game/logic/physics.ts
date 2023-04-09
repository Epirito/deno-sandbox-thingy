import MultiMap from "../utils/multi-map.ts";
import { Entity, IEntity } from "./entity.ts";
import { sum, rotatedBy } from "../utils/vector.ts";
import { System } from "./simulation.ts";
import { CopiableEventTarget, CopiableEventTargetEvent } from "../utils/custom-event-target.ts";
import { ActionRequester } from "./trivial-systems.ts";
import { ThingManager } from "./thing-manager.ts";
import { SaturatedAction } from "./action.ts";

class PhysicsState {
  constructor(public position: [number, number], public rotation: number) {}
  absPosition(
    attachedVector: [number, number],
  ): [number, number] {
    return sum(this.position, rotatedBy(attachedVector, this.rotation));
  }
  copy() {
    return new PhysicsState(this.position, this.rotation);
  }
}
export class EntityEvent implements CopiableEventTargetEvent {
  terms: string[];
  constructor(entity: Entity) {
    this.terms = [entity.id];
  }
}
export class VoidEvent implements CopiableEventTargetEvent {}
const voidEvent = new VoidEvent();
export class PhysicsSystem implements IPhysicsSystem {
  private unplaced!: CopiableEventTarget<VoidEvent>; 
  private placed: CopiableEventTarget<VoidEvent>;
  private placedAt: CopiableEventTarget<EntityEvent>;
  private unplacedFrom: CopiableEventTarget<EntityEvent>;
  private stateByEntity = new Map<Entity, PhysicsState>();
  private entitiesByPosition = new MultiMap<string, Entity>();
  constructor({actionRequester}: Record<string, System>) {
    this.unplaced = new CopiableEventTarget<VoidEvent>(actionRequester as ActionRequester);
    this.placed = new CopiableEventTarget<VoidEvent>(actionRequester as ActionRequester);
    this.placedAt = new CopiableEventTarget<EntityEvent>(actionRequester as ActionRequester);
    this.unplacedFrom = new CopiableEventTarget<EntityEvent>(actionRequester as ActionRequester);
  }
  position(entity: Entity) {
    return this.stateByEntity.get(entity)?.position;
  }
  rotation(entity: Entity) {
    return this.stateByEntity.get(entity)?.rotation;
  }
  facing(entity: Entity) {
    return rotatedBy([1,0], this.rotation(entity)!);
  }
  inFrontOf(entity: Entity) {
    return sum(this.facing(entity), this.position(entity)!);
  }
  isBlocked(position: [number, number]) {
    return this.entitiesByPosition.get(JSON.stringify(position))?.some(x=>x.blocksMovement) ?? false
  }
  entitiesAt(position: [number, number]) {
    return this.entitiesByPosition.get(JSON.stringify(position)) ?? [];
  }
  onUnplaced(entity: Entity, action: SaturatedAction) {
    this.unplaced.addEventListener(entity.id, action);
  }
  removeOnUnplaced(entity: Entity, action: SaturatedAction) {
    this.unplaced.removeEventListener(entity.id, action);
  }
  onPlaced(entity: Entity, action: SaturatedAction) {
    this.placed.addEventListener(entity.id, action);
  }
  removeOnPlaced(entity: Entity, action: SaturatedAction) {
    this.placed.removeEventListener(entity.id, action);
  }
  removeOnUnplacedFrom(position: [number, number], action: SaturatedAction) {
    this.unplacedFrom.removeEventListener(JSON.stringify(position), action);
  }
  onPlacedAt(position: [number, number], action: SaturatedAction) {
    this.placedAt.addEventListener(JSON.stringify(position), action);
  }
  onUnplacedFrom(position: [number, number], action: SaturatedAction) {
    this.unplacedFrom.addEventListener(JSON.stringify(position), action);
  }
  removeOnPlacedAt(position: [number, number], action: SaturatedAction) {
    this.placedAt.removeEventListener(JSON.stringify(position), action);
  }
  unplace(entity: Entity) {
    const state =  this.stateByEntity.get(entity);
    if (state) {
      this.unplaced.dispatch(entity.id, voidEvent);
      this.unplacedFrom.dispatch(JSON.stringify(state.position), new EntityEvent(entity));
      this.entitiesByPosition.remove(JSON.stringify(state.position), entity)
      this.stateByEntity.delete(entity);
    }
  }
  private _place(entity: Entity, position: [number, number], rotation: number) {
    const newPosJSON = JSON.stringify(position);
    this.stateByEntity.set(entity, new PhysicsState(position, rotation));
    this.entitiesByPosition.set(newPosJSON, entity)
    this.placed.dispatch(entity.id, voidEvent);
    this.placedAt.dispatch(newPosJSON, new EntityEvent(entity));
  }
  place(entity: Entity, options: {position?: [number, number], rotation?: number}) {
    // to do: make it private and hide it behind a method that checks for collisions
    if (options.position===undefined) {
      options.position = this.stateByEntity.get(entity)!.position;
    }
    if (options.rotation===undefined) {
      options.rotation = this.stateByEntity.get(entity)!.rotation;
    }
    if (this.stateByEntity.has(entity)) {
      this.unplace(entity);
    }
    this._place(entity, options.position, options.rotation);
  }
  placeIfNotBlocked(entity: Entity, position: [number, number]) {
    if (this.isBlocked(position)) {
      return false
    }
    this.place(entity, {position});
    return true
  }
  moveAxis(entity: Entity, delta: number, axis: 0 | 1) {
    const state = this.stateByEntity.get(entity)!;
    const destination: [number, number] = [...state.position]
    destination[axis] += delta;
    return this.placeIfNotBlocked(entity, destination)
  }
  cleanUpDestroyed(entity: Entity) {
    this.unplace(entity);
  }
  copy(dependencies: Record<string, System>) {
    const thingManager = dependencies['thingManager'] as ThingManager;
    const copy = new PhysicsSystem(dependencies);
    for (const [entity, state] of this.stateByEntity) {
      copy.stateByEntity.set(thingManager.byId(entity.id)!, state.copy());
    }
    this.entitiesByPosition.forEach((entities, position)=>{
      entities.forEach(entity=>copy.entitiesByPosition.set(position, entity))
    })
    copy.placed = this.placed.copy()
    copy.unplaced = this.unplaced.copy()
    copy.placedAt = this.placedAt.copy()
    copy.unplacedFrom = this.unplacedFrom.copy()
    return copy
  }
}

export interface IPhysicsSystem extends System {
  position(entity: IEntity): [number, number] | undefined;
  rotation(entity: IEntity): number | undefined;
  facing(entity: IEntity): [number, number] | undefined;
  inFrontOf(entity: IEntity): [number, number] | undefined;
  isBlocked(position: [number, number]): boolean;
  entitiesAt(position: [number, number]): IEntity[],
}