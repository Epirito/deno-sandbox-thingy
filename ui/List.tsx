import { useRef } from "preact/hooks";
import { useDOMEvent, useFocusedRef } from "./hooks.ts";

export default function List(props: {
        title?: string,
        onItemSelect?: {[key: string]: (id: string)=>void},
        onNullSelect?: {[key: string]: ()=>void}, 
        examinationOutputs: {glyph:string, name: string, description: string, id: string}[]
    }) {
    const {examinationOutputs}  = props;
    const focused = useFocusedRef()
    const itemRefs = useRef({} as Record<string, EventTarget | null>)
    function getSelectedId() {
        for(const id in itemRefs.current) {
            if (focused.current && itemRefs.current[id]===focused.current) {
                return id
            }
        }
    }
    useDOMEvent('keydown', (e)=>{
        const selected = getSelectedId()
        if (selected===undefined) {
            for(const key in props.onItemSelect) {
                if (e.key===key) {
                    props.onNullSelect?.[key]()
                }
            }
        }else {
            for(const key in props.onItemSelect) {
                if (e.key===key) {
                    props.onItemSelect?.[key](selected)
                }
            }
        }
    }, [])
    itemRefs.current = {}
    return (
        <div>
            <h1>{props.title}</h1>
            {examinationOutputs.map((output) => {
                return (<button key={output.id} ref={el=>{itemRefs.current[output.id] = el}} disabled={!props.onItemSelect}>
                    <h3>{output.glyph +' '+ output.name}</h3>
                    <p>{output.description}</p>
                </button>)
                }
            )}
        </div>)

}