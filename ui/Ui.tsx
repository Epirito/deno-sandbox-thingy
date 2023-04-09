import { CraftingComponent, craft, drop, insertInto, interact, open, pickUp, use, withdraw } from "game";
import { IEntity } from "game";
import { SimulationPOV } from "game";
import List from "./List.tsx";
import { getGlyph, getStaticGlyph } from "./glyphs.ts";
import { useGameState } from "./hooks.ts";
import { addUpdateListener } from "./screen-update.ts";
import ListGameItems, { entityPresentation } from "./ListGameItems.tsx";
import Equipped from "./Equipped.tsx";

function CraftingUi(props: {craftingComp: CraftingComponent, pov: SimulationPOV}) {
    const {craftingComp, pov} = props;
    const items = craftingComp.recipes
    return <ListGameItems
        title="Crafting"
        items={items}
        presentItem={recipe=>{
            const [name, description] = recipe.examinableComp.examine(pov.player)
            return {
                name, description,
                glyph: getStaticGlyph(recipe.examinableComp),
                id: craftingComp.recipes.indexOf(recipe).toString()!
            }
        }}
        onItemSelect={{
            e: (i)=>{pov.playerAction(craft.iota, [pov.openContainer!.id], {i})}
        }}
    />
}
export default function Ui(props: {pov: SimulationPOV}) {
    const pov = props.pov;
    const player = useGameState(()=>pov.player!, addUpdateListener)
    const equipped = useGameState(()=>pov.container.getEquipped(player), addUpdateListener)
    const craftingComp = useGameState(()=>pov.openContainer?.craftingComp, addUpdateListener)
    const getContents = ()=>pov.openContainer ? 
        pov.container.contents(pov.openContainer) : null
    const getEntities = ()=>pov.phys.entitiesAt(pov.listFront ? 
        pov.phys.inFrontOf(player)! : pov.phys.position(player)!).filter(entity=>entity!==player)
    const items = useGameState(()=>getContents() ?? getEntities(), addUpdateListener)
    return <div>{craftingComp ? <CraftingUi craftingComp={craftingComp} pov={pov}/> : <ListGameItems
        title={pov.openContainer ? pov.openContainer.examinableComp?.examine(player, pov.openContainer)[0] : undefined}
        items={items}
        presentItem={entityPresentation(player, pov)}
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
            e: ()=>{
                if (pov.openContainer) {
                    pov.playerAction(interact.iota, [pov.openContainer.id])
                }else {
                    pov.playerAction(use.iota, [])
                }
            },
            q: ()=>{
                if (pov.openContainer) {
                    pov.playerAction(insertInto.iota, [pov.openContainer.id])
                }else {
                    pov.playerAction(drop.iota, [])
                }
            }
        }}
    />}
    {equipped ? <Equipped item={equipped} player={player} pov={pov}/> : <h1>No item equipped</h1>}
    </div>
}