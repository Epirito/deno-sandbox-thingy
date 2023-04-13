import { ExaminableComponent, IEntity, IPhysicsSystem, examinables, Entity, SimulationPOV} from "game";
import { TerrainSpec } from "../game/logic/terrain.ts";
const glyphs: Map<ExaminableComponent | undefined, (entity: IEntity, phys?: IPhysicsSystem)=>string> = new Map()
const rawGlyphs: Record<string, string[] | {on: string, off: string}> = {
    craftingTable: ['🛠️'],
    chest: ['🗄️'],
    man: ['👨'],
    wire: ['➰'],
    pressurePlate: ['_'],
    bimux: ['>', 'A', '<', 'V'],
    belt: ['➡️', '⬆️', '⬅️', '⬇️'],
    lamp: {on: '💡', off: 'O'},
    bullet: ['-'],
    gun: ['🔫'],
    car: ['🚗'],
    zombie: ['🧟'],
    water: ['🌊'],
    bucket: ['🥛'],
    log: ['🪵'],
    rock: ['🪨'],
    tree: ['🌳'],
    pineTree: ['🌲'],
    palmTree: ['🌴'],
    cactus: ['🌵'],
    herb: ['🌿'],
    pick: ['⛏️'],
    axe: ['🪓'],
    trap: ['🪤'],
    rabbit: ['🐇'],
    wolf: ['🐺'],
    bear: ['🐻'],
    deer: ['🦌'],
    cow: ['🐮'],
    sheep: ['🐑'],
    pig: ['🐷'],
    chicken: ['🐔'],
    fish: ['🐟'],
    crab: ['🦀'],
    lobster: ['🦞'],
    shrimp: ['🦐'],
    snail: ['🐌'],
    turtle: ['🐢'],
    frog: ['🐸'],
    snake: ['🐍'],
    lizard: ['🦎'],
    spider: ['🕷️'],
    scorpion: ['🦂'],
    bee: ['🐝'],
    wasp: ['🐝'],
    ant: ['🐜'],
    butterfly: ['🦋'],
    bat: ['🦇'],
    bird: ['🐦'],
    parrot: ['🦜'],
    owl: ['🦉'],
    eagle: ['🦅'],
}
const terrainGlyphs = ['🟫', '🟨', '🟦', '🟦', '🟫', '🌾', '🌱', '◼️', '◼️']
for(const glyph in rawGlyphs) {
    const val = rawGlyphs[glyph]
    if ("on" in val) {
        glyphs.set(examinables[glyph], (entity: IEntity)=>{
            if (entity.lightSourceComp) {
                return val.on
            }
            return val.off
        })
    }else{
        glyphs.set(examinables[glyph], (entity: IEntity, phys?: IPhysicsSystem)=> {
            const glyphRotation = (phys?.rotation(entity) ?? 0) % val.length
            return val[glyphRotation]
        })
    }
}
export function getGlyph(entity: IEntity, pov: SimulationPOV):string {
    return glyphs.get(entity.examinableComp)!(entity, pov.phys)
}
export function getTerrainGlyph(terrain: TerrainSpec) {
    return (terrainGlyphs[terrain.iota] as string)
}
const dummyEntity =  new Entity('',1)
export function getStaticGlyph(examinable: ExaminableComponent) {
    return glyphs.get(examinable)!(dummyEntity)
}