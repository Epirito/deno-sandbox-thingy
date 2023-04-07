import { Entity, IEntity } from "./entity.ts";

export interface ExaminableComponent {
    examine(actor?: IEntity, me?: IEntity): [string, string]
}

export class PlainExaminableComponent implements ExaminableComponent {
    constructor(private name: string, private description: string) {}
    examine(): [string, string] {
        return [this.name, this.description]
    }
}
export class LightSourceExaminableComponent implements ExaminableComponent {
    constructor(private name: string, private description: string) {}
    examine(_: Entity, me: Entity): [string, string] {
        return [this.name, this.description + (me.lightSourceComp ? "\nIt's turned on." : "")]
    }
}