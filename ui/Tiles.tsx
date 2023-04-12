import { JSX } from "preact/jsx-runtime";
import { IEntity, SimulationPOV, use } from "../game/mod.ts";
import { getGlyph } from "./glyphs.ts";
import { useDOMEvent, useGameState } from "./hooks.ts";
import { addUpdateListener } from "./screen-update.ts";
import { sum } from "../game/utils/vector.ts";
import {useState, useEffect} from 'preact/hooks'
import { WORLDSIZE } from "../game/logic/constants.ts";
type Tile = {glyph: string, bg: [number, number, number]}
export default function Tiles(props: {pov: SimulationPOV, dimensions: [number, number]}) {
    const [mousePos, setMousePos] = useState(undefined as [number, number] | undefined)
    const [tiles, cameraPos] = useGameState(()=>{
        const cameraPos = sum(props.pov.phys.position(props.pov.player!)!, 
            [-Math.floor(props.dimensions[0]/2), -Math.floor(props.dimensions[1]/2)])
            .map((x, i)=>Math.min(Math.max(x, 0), WORLDSIZE-props.dimensions[i])) as [number, number]
        const result = [[]] as Tile[][]
        for(let y = 0; y < props.dimensions[1]; y++) {
            for(let x = 0; x < props.dimensions[0]; x++) {
                const entitiesAt = props.pov.phys.entitiesAt(sum(cameraPos, [x, y]))
                const entity = entitiesAt[entitiesAt.length-1] as IEntity | undefined
                const glyph = entity ? getGlyph(entity, props.pov) : "."
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
        return [result, cameraPos]
    }, addUpdateListener)
    const hoverPos = mousePos ? sum(cameraPos, mousePos) : undefined
    return (<div 
        onMouseLeave={()=>{setMousePos(undefined)}}
        style={{
        userSelect: 'none', 
        fontFamily: 'Courier New', 
        gridTemplateColumns: `repeat(${tiles[0].length}, 20px)`, 
        gridTemplateRows: `repeat(${tiles.length}, 20px)`, 
        gap: 0,
        display: 'grid', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: 'fit-content'
    }}>
        {([] as JSX.Element[]).concat(...tiles.map((row, y) => 
            row.map((tile, x) => (
            <div 
                onMouseEnter={()=>{setMousePos([x, y])}} 
                onClick={(e)=>{
                    e.preventDefault()
                    if (hoverPos) {
                        if (e.button===0) {
                            props.pov.playerAction(use.iota, [], {hoverPos})
                        }
                    }}
                } 
                style={{backgroundColor: mousePos?.every((a,i)=>a===[x,y][i]) ? 'darkgrey' : `rgba(${tile.bg.join(',')})`, width: "100%", height: "100%", textAlign: "center"}}>
                {tile.glyph}
            </div> 
            ))))}
    </div>)
}
([] as number[]).concat(...[[1,2],[3,4]])