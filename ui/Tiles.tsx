import { JSX } from "preact/jsx-runtime";
import { IEntity, SimulationPOV, use } from "../game/mod.ts";
import { getGlyph, getTerrainGlyph } from "./glyphs.ts";
import { useDOMEvent, useGameState } from "./hooks.ts";
import { addUpdateListener } from "./screen-update.ts";
import { sum } from "../game/utils/vector.ts";
import {useState, useEffect} from 'preact/hooks'
import { WORLDSIZE } from "../game/logic/constants.ts";
import { DungeonMaster } from "../game/stuff/dungeon-master.ts";
type Tile = {glyph: string, bg: [number, number, number]}
export default function Tiles(props: {pov: SimulationPOV, dimensions: [number, number], debug: DungeonMaster | undefined}) {
    const [mousePos, setMousePos] = useState(undefined as [number, number] | undefined)
    const [tiles, cameraPos] = useGameState(()=>{
        const cameraPos = props.pov.player
            ? sum(props.pov.phys.position(props.pov.player)!,
            [-Math.floor(props.dimensions[0]/2), -Math.floor(props.dimensions[1]/2)])
            .map((x, i)=>Math.min(Math.max(x, 0), WORLDSIZE-props.dimensions[i])) as [number, number]
            : undefined
        const result = [[]] as Tile[][]
        if (cameraPos) {
            for(let y = 0; y < props.dimensions[1]; y++) {
                for(let x = 0; x < props.dimensions[0]; x++) {
                    const pos = sum(cameraPos, [x, y])
                    const entitiesAt = props.pov.phys.entitiesAt(pos)
                    const entity = entitiesAt[entitiesAt.length-1] as IEntity | undefined
                    const glyph = entity ? getGlyph(entity, props.pov) : getTerrainGlyph(props.pov.terrain.get(pos))
                    let bg: [number, number, number] = [0,0,0]
                    if (props.debug) {
                        const debug = Math.min(255, props.debug.flowField('human', pos) * 10)
                        bg = [debug, debug, debug]
                    }else if (entity?.damageableComp) {
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
        }
        return [undefined, cameraPos]
    }, addUpdateListener)
    const hoverPos = mousePos && cameraPos ? sum(cameraPos, mousePos) : undefined
    if (!tiles) return <div></div>
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