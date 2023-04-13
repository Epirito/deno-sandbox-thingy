import { IEntity, Recipe, SimulationPOV, craft, drop, interact, pickUp, withdraw } from "../game/mod.ts";
import { open } from "../game/stuff/actions.ts";
import Menu from "./Menu.tsx";
import { entityInUi, recipeInUi } from "./presentation.tsx";

export function ListGameItems({title, items, pov}: {title: string | undefined, items: IEntity[], pov: SimulationPOV}) {
    const eAction = (entity: IEntity)=> {
        if (entity.interactComp) {
            pov.playerAction(interact.iota, [entity.id])
            return
        }
        pov.playerAction(open.iota, [entity.id])
    }
    return <div>
        <h1>{title}</h1>
        <Menu items={items} presentation={
        entityInUi(
            pov, 
            eAction,
            {
                e: eAction,
                q: (entity)=>{
                    if (pov.container.getEquipped(pov.player!)) {
                        return
                    }
                    if (pov.openContainer) {
                        pov.playerAction(withdraw.iota, [entity.id, pov.openContainer.id])
                    }else {
                        pov.playerAction(pickUp.iota, [entity.id])
                    }
                }
            }
        )}/>
    </div>
}
export function ListCrafting({pov}: {pov: SimulationPOV}) {
    const entity = pov.openContainer!
    const craftAction = (recipe: Recipe)=>{
        pov.playerAction(craft.iota, [entity.id], {i: entity.craftingComp!.recipes.indexOf(recipe)})
    }
    return <div>
        <h1>{entity.examinableComp?.examine(pov.player, entity)[0]}</h1>
        <Menu items={entity.craftingComp!.recipes} presentation={
            recipeInUi(
                pov,
                craftAction,
                {
                    e: craftAction
                }
            )
        }
        />
    </div>
}