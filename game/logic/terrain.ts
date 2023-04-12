import { System } from "../mod.ts"
import { WORLDSIZE } from "./constants.ts"

export class TerrainSpec {
    static byIota: TerrainSpec[] = []
    iota: number
    constructor(readonly name: string, readonly harvesting: Record<string, number> = {}) {
        this.iota = TerrainSpec.byIota.length
        TerrainSpec.byIota.push(this)
    }
}
export class TerrainSystem implements System {
    constructor(private array = new Uint8Array(WORLDSIZE**2)) {}
    get(pos: [number, number]) {
        return TerrainSpec.byIota[this.array[pos[1]*WORLDSIZE+pos[0]]]
    }
    set(pos: [number, number], spec: TerrainSpec) {
        this.array[pos[1]*WORLDSIZE+pos[0]] = spec.iota
    }
    copy(): System {
        return new TerrainSystem(this.array.slice())
    }
}