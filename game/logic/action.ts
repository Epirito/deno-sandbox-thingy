import { Entity } from "./entity.ts";
import { System } from "./simulation.ts";

export class Action {
    static n = 0;
    private static actionByIota = new Map<number, Action>();
    static byIota = (iota: number) => Action.actionByIota.get(iota);
    readonly iota!: number
    constructor(readonly verb?: (terms: string[])=>string, readonly effect?: (dependencies: Record<string, System>)=>(terms: Entity[], vals?: Record<string, unknown>)=>void|(string|undefined), readonly world = false) {
        this.iota = Action.n++;
        Action.actionByIota.set(this.iota, this);
    }
    from(terms: Entity[], vals?: Record<string, unknown>): SaturatedAction {
        return [this.iota, terms.map(x=>x.id), vals ?? {}]
    }
}
export type SaturatedAction = [number, string[], Record<string, unknown>]