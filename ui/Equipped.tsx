import { IEntity, SimulationPOV } from "../game/mod.ts";
import { ListGameItems } from "./lists.tsx";
import { entityInUi } from "./presentation.tsx";
export default function Equipped(props: {item: IEntity, player: IEntity, pov: SimulationPOV}) {
    const {item, player, pov} = props;
    return <div>
        <h1>Equipped:</h1>
        {entityInUi(pov, entity=>{}, {})({item, selected: false})}
    </div>
}