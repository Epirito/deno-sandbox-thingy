import { Player } from "https://raw.githubusercontent.com/Epirito/multiplayer/main/client/player.ts";
import { IEntity, SimulationPOV } from "../game/mod.ts";
import List from "./List.tsx";
import ListGameItems from "./ListGameItems.tsx";
import { entityPresentation } from "./ListGameItems.tsx";

export default function Equipped(props: {item: IEntity, player: IEntity, pov: SimulationPOV}) {
    const {item, player, pov} = props;
    return <ListGameItems
        title={'Equipped'}
        items={[item]}
        presentItem={entityPresentation(player, pov)}
    />
}