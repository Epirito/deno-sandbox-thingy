import { useRef, useEffect,useState } from "preact/hooks";
import { MultiplayerWrapper } from "../game/logic/multiplayer-simulation-wrapper.ts";
import { SimulationPOV } from "../game/mod.ts";
import { emptySimulation, spawnPlayers } from "../game/stuff/world-gen.ts";
import { walk } from "../game/stuff/actions.ts";
import Ui from "../ui/Ui.tsx";
import { useGameState } from "../ui/hooks.ts";
import Tiles from "../ui/Tiles.tsx";
import Lobby from "../ui/Lobby.tsx";
function getPov(updater: EventTarget) {
    return new Promise<SimulationPOV>((res)=>{
        let playerIds: string[] | undefined = undefined
        let myself: SimulationPOV | undefined = undefined
        /* awful spaghetti: MultiplayerWrapper's onStart needs to reference 
        SimulationPov in order to provide the player's entity id to it, but 
        SimulationPov depends on MultiplayerWrapper for its own constructor. So we 
        pass an uninitialized reference to it. In reality multiplayerWrapper shouldn't 
        exist and should just be merged into SimulationPov, but I'm not doing that 
        right now.
        */
        const wrapper = new MultiplayerWrapper(
            nPlayers => {
                const [sim, playerIdsConst] = spawnPlayers(emptySimulation(), nPlayers, [1,1])
                playerIds = playerIdsConst
                return sim
            }, 
            (_) => {
                updater.dispatchEvent(new Event("update"))
            },
            (_) => {
                myself = new SimulationPOV(wrapper, playerIds![wrapper.lockstep.player!])
                document.addEventListener('keydown', (e) => {
                    let rotation: number | undefined = undefined
                    switch(e.key) {
                    case 'l':
                        rotation = 0
                    break
                    case 'i':
                        rotation = 1
                    break
                    case 'j':
                        rotation = 2
                    break
                    case 'k':
                        rotation = 3
                    break
                    }
                    if (rotation===undefined) {
                    return
                    }
                    myself!.playerAction(walk.iota, [], {rotation})
                })
                res(myself)
            }
        )
    })
}
export default function App() {
    const screenUpdater = useRef(new EventTarget())
    const simPov = useRef(undefined as SimulationPOV | undefined)
    useEffect(()=>{
        async function f() {
            simPov.current = await getPov(screenUpdater.current)
        }
        f()
    }, [])
    const addListener = (listener: (e: Event)=>void)=>{
        screenUpdater.current.addEventListener('update', listener)
    }
    const removeListener = (listener: (e: Event)=>void) =>{
        screenUpdater.current.addEventListener('update', listener)
    }
    const [playerId, setPlayerId] = useState(()=>simPov.current?.playerId)
    useEffect(()=>{
        screenUpdater.current.addEventListener('update', ()=>{
            setPlayerId(simPov.current?.playerId)
        })
    }, [])
    const onReady = ()=>{    }
    return <div>{playerId ? 
        <div><Ui pov={simPov.current!} 
            addScreenListener={addListener} 
            removeScreenListener={removeListener}
        />
        <Tiles pov={simPov.current!} addScreenListener={addListener} removeScreenListener={removeListener}/></div>: <Lobby onReady={onReady}/>
    }</div>
}