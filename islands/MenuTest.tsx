import Menu from "../ui/Menu.tsx";
import { BasicPresentation } from "../ui/presentation.tsx";


export default function MenuTest() {
    return <Menu items={[{label: "what up"}, {label: "hey"}, {label: "yo"}]} Presentation={BasicPresentation}/>
}