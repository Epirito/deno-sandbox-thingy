import { IEntity, SimulationPOV } from "game";
import { useGameState } from "./hooks.ts";
import { addUpdateListener } from "./screen-update.ts";
import Equipped from "./Equipped.tsx";
import { ListGameItems, ListCrafting } from "./lists.tsx";

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
    return <div>{craftingComp ? <ListCrafting pov={pov}/> : <ListGameItems
        title={pov.openContainer ? pov.openContainer.examinableComp?.examine(player, pov.openContainer)[0] : undefined}
        items={items}
        pov={pov}
    />}
    {equipped ? <Equipped item={equipped} player={player} pov={pov}/> : <h1>No item equipped</h1>}
    </div>
}