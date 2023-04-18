import { SimulationPOV } from "../game/logic/simulation-pov.ts";
import { IEntity, Recipe } from "../game/mod.ts";
import { getGlyph, getStaticGlyph } from "./glyphs.ts";
import { ComponentType } from 'preact'
import { useDOMEvent } from "./hooks.ts";
import { useState } from "preact/hooks";
export function PresentationButton<T>({item, selected, click, keyDown, children}: {
    item: T, 
    selected: boolean, 
    click: (item: T)=>void, 
    keyDown: Record<string,(item: T)=>void>,
    children: any | any[]
}) {
    const [mouseSelected, setMouseSelected] = useState(false)
    useDOMEvent('keydown', (e: KeyboardEvent)=>{
        if (selected && keyDown[e.key]) {
            keyDown[e.key](item)
        }
    }, [selected, item])
    return <button 
            onClick={()=>{
                click(item)
            }}
            onMouseEnter={()=>{setMouseSelected(true)}}
            onMouseLeave={()=>{setMouseSelected(false)}}
            style={{backgroundColor: mouseSelected? 'cyan' : selected ? 'lightblue' : 'white'}}
        >{children}</button>
}
export const recipeInUi = (pov: SimulationPOV, onClick: (item: Recipe)=>void, onKeyDown: Record<string,(item: Recipe)=>void>) =>
    ({item, selected}: {item: Recipe, selected: boolean}) => {
        const [name, description] = item.examinableComp.examine(pov.player)
        const glyph = getStaticGlyph(item.examinableComp)
        return <PresentationButton click={onClick} keyDown={onKeyDown} selected={selected} item={item}>
            <h3>{`${glyph} ${name}`}</h3>
            <p>{description}</p>
        </PresentationButton>
    }
export const entityInUi = (pov: SimulationPOV, onClick: (item: IEntity)=>void, onKeyDown: Record<string,(item: IEntity)=>void>) => 
    ({item, selected}: {item: IEntity, selected: boolean}) => {
        const [name, description] = item.examinableComp!.examine(pov.player, item)
        const glyph = getGlyph(item, pov)
        return <PresentationButton<IEntity>
            click={onClick}
            keyDown={onKeyDown}
            selected={selected}
            item={item}
        >
            <h3>{`${glyph} ${name}`}</h3>
            <p>{description}</p>
        </PresentationButton>
    }
export function BasicPresentation({item, selected}: {item: {label: string}, selected: boolean}) {
    return <button style={{backgroundColor: selected? 'green':'white'}}onClick={()=>alert(`${item.label}`)}>
        {item.label}
    </button>
}