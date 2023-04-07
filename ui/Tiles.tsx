import { IEntity, SimulationPOV } from "../game/mod.ts";
import { getGlyph } from "./glyphs.ts";
import { useGameState } from "./hooks.ts";

export default function Tiles(props: {pov: SimulationPOV, addScreenListener: any, removeScreenListener: any}) {
    const tiles = useGameState(()=>{
        const result = [[]] as string[][]
        for(let y = 0; y < 10; y++) {
            for(let x = 0; x < 10; x++) {
                const entitiesAt = props.pov.phys.entitiesAt([x, y])
                const entity = entitiesAt[0] as IEntity | undefined
                const glyph = entity ? getGlyph(entity, props.pov) : "."
                result[result.length-1].push(glyph)
            }
            result.push([])
        }
        return result
    }, props.addScreenListener, props.removeScreenListener)
    return (<div>
        {tiles.map(row => <div>{row.join('')}</div>)}
    </div>)
}