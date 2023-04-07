import { craft, drop, insertInto, open, pickUp, withdraw } from "game";
import { IEntity } from "game";
import { SimulationPOV } from "game";
import List from "./List.tsx";
import { getGlyph, getStaticGlyph } from "./glyphs.ts";
import { useGameState } from "./hooks.ts";
function ListGameItems<T>(props: {
        getItems: ()=>T[],
        presentItem: (item: T)=>{glyph:string, name: string, description: string, id: string},
        onItemSelect: Record<string, (id: string)=>void>,
        onNullSelect?: Record<string, ()=>void>,
        updating: [(listener: (e: Event)=>void)=>void, (listener: (e: Event)=>void)=>void]
    }) {
    const items = useGameState(props.getItems, props.updating[0], props.updating[1])
    return <List
        examinationOutputs={items.map(props.presentItem)}
        onItemSelect={props.onItemSelect}
        onNullSelect={props.onNullSelect}
    />
}
function CraftingUi(props: {pov: SimulationPOV, updating: [(listener: (e: Event)=>void)=>void, (listener: (e: Event)=>void)=>void]}) {
    return <ListGameItems
        getItems={()=>props.pov.openContainer?.craftingComp!.recipes ?? []}
        presentItem={recipe=>{
            const [name, description] = recipe.examinableComp.examine(props.pov.player)
            return {
                name, description,
                glyph: getStaticGlyph(recipe.examinableComp),
                id: props.pov.openContainer!.craftingComp!.recipes.indexOf(recipe).toString()!
            }
        }}
        onItemSelect={{
            e: (i)=>{props.pov.playerAction(craft.iota, [props.pov.openContainer!.id], {i})}
        }}
        updating = {props.updating}
    />
}
export default function Ui(props: {pov: SimulationPOV, addScreenListener: (listener: (e: Event)=>void)=>void, removeScreenListener:(listener: (e: Event)=>void)=>void}) {
    const pov = props.pov;
    const player = useGameState(()=>pov.player!, props.addScreenListener, props.removeScreenListener)
    const craftingComp = useGameState(()=>pov.openContainer?.craftingComp, props.addScreenListener, props.removeScreenListener)
    const getContents = ()=>pov.openContainer ? 
        pov.container.contents(pov.openContainer) : null
    const getEntities = ()=>pov.phys.entitiesAt(pov.listFront ? 
        pov.phys.inFrontOf(player)! : pov.phys.position(player)!).filter(entity=>entity!==player)
    if (craftingComp) {
        return <CraftingUi pov={props.pov} updating={[props.addScreenListener, props.removeScreenListener]}/>
    }
    return <ListGameItems
        getItems={()=>getContents() ?? getEntities()}
        presentItem={(entity: IEntity)=>{
            const examinable = entity.examinableComp!;
            const [name, description] = examinable.examine(player, entity);
            return {
            glyph: getGlyph(entity, pov),
            name,
            description,
            id: entity.id
            }}
        }
        onItemSelect={{
            e: (id)=>{pov.playerAction(open.iota, [id])},
            q: (id)=>{
                if (pov.openContainer) {
                    pov.playerAction(withdraw.iota, [id, pov.openContainer.id])
                }else {
                    pov.playerAction(pickUp.iota, [id])
                }
            }
        }}
        onNullSelect={{
            q: ()=>{
                if (pov.openContainer) {
                    pov.playerAction(insertInto.iota, [pov.openContainer.id])
                }else {
                    pov.playerAction(drop.iota, [])
                }
            }
        }}
        updating={[props.addScreenListener, props.removeScreenListener]}
    />
}