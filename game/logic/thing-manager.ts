import random from "../utils/random.ts";
import { Entity } from "./entity.ts";
import { System } from "./simulation.ts";

export class ThingManager implements System {
    entityById: Map<string, Entity> = new Map();
    make?(thing: string): Entity;
    destroy?(entity: Entity): void;
    static getId() {
        return random.next().toString(36).substring(2)
    }
    byId(id: string) {
        return this.entityById.get(id)
    }
    bareEntity(size: number, blocksMovement = false) {
        const entity = new Entity(ThingManager.getId(), size, blocksMovement)
        this.entityById.set(entity.id, entity)
        return entity
    }
    copy(_?: Record<string, System> | undefined): System {
        const copy = new ThingManager()
        this.entityById.forEach((entity, id)=>{
            copy.entityById.set(id, entity.copy())
        })
        return copy
    }
}