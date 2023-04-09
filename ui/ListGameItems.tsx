import { IEntity, SimulationPOV } from "../game/mod.ts";
import List from "./List.tsx"
import { getGlyph } from "./glyphs.ts";
export const entityPresentation = (player: IEntity, pov: SimulationPOV)=>(entity: IEntity)=>{
    const examinable = entity.examinableComp!;
    const [name, description] = examinable.examine(player, entity);
    return {
    glyph: getGlyph(entity, pov),
    name,
    description,
    id: entity.id
    }
}
export default function ListGameItems<T>(props: {
    title?: string,
    items: T[],
    presentItem: (item: T)=>{glyph:string, name: string, description: string, id: string},
    onItemSelect?: Record<string, (id: string)=>void>,
    onNullSelect?: Record<string, ()=>void>
}) {
const items = props.items
return <List
    title={props.title}
    examinationOutputs={items.map(props.presentItem)}
    onItemSelect={props.onItemSelect}
    onNullSelect={props.onNullSelect}
/>
}