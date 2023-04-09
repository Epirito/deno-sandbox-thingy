import { ExaminableComponent, IEntity, IPhysicsSystem, examinables, Entity, SimulationPOV} from "game";
const glyphs: Map<ExaminableComponent | undefined, (entity: IEntity, phys?: IPhysicsSystem)=>string> = new Map()
const rawGlyphs: Record<string, string[] | {on: string, off: string}> = {
    craftingTable: ['🛠️'],
    chest: ['🗄️'],
    man: ['👨'],
    wire: ['➰'],
    pressurePlate: ['__'],
    bimux: ['>>', 'AA', '<<', 'VV'],
    belt: ['➡️', '⬆️', '⬅️', '⬇️'],
    lamp: {on: '💡', off: 'OO'},
    bullet: ['--'],
    gun: ['🔫'],
    car: ['🚗'],
}
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
const dummyEntity =  new Entity('',1)
export function getStaticGlyph(examinable: ExaminableComponent) {
    return glyphs.get(examinable)!(dummyEntity)
}