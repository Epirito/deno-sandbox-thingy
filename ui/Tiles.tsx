import { IEntity, SimulationPOV } from "../game/mod.ts";
import { getGlyph } from "./glyphs.ts";
import { useGameState } from "./hooks.ts";
import { addUpdateListener } from "./screen-update.ts";

export default function Tiles(props: {pov: SimulationPOV}) {
    const tiles = useGameState(()=>{
        const result = [[]] as {glyph: string, bg: [number, number, number]}[][]
        for(let y = 0; y < 10; y++) {
            for(let x = 0; x < 10; x++) {
                const entitiesAt = props.pov.phys.entitiesAt([x, y])
                const entity = entitiesAt[0] as IEntity | undefined
                const glyph = entity ? getGlyph(entity, props.pov) : ".."
                let bg: [number, number, number] = [0,0,0]
                if (entity?.damageableComp) {
                    const hp = entity.damageableComp.integrity / entity.damageableComp.total
                    if (hp < 1.0) {
                        bg = [128 * (1-hp), 128 * hp, 0] 
                    }
                }
                result[result.length-1].push({glyph, bg })
            }
            result.push([])
        }
        return result
    }, addUpdateListener)
    return (<div style={{fontFamily: 'Courier New'}}>
        {tiles.map(row => <div>{row.map(tile => (
            <span style={{backgroundColor: `rgba(${tile.bg.join(',')})`}}>
                {tile.glyph}
            </span> 
            ))}</div>)}
    </div>)
}