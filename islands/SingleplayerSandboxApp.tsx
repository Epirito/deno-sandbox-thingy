import { BasicModel, LockstepClient, SingleplayerClient } from "modularMultiplayer";
import { debugWorld, spawnPlayers } from "../game/stuff/world-gen.ts";
import { useEffect, useRef, useState } from "preact/hooks";
import Simulation, { SimulationWrapper } from "../game/logic/simulation.ts";
import { Model } from "modularMultiplayer";
import { PhysicsSystem, SaturatedAction, SimulationPOV } from "../game/mod.ts";
import { useDOMEvent, useGameState } from "../ui/hooks.ts";
import { listenForMovementInput } from "../ui/inputs.ts";
import { addUpdateListener, updater } from "../ui/screen-update.ts";
import Ui from "../ui/Ui.tsx";
import Tiles from "../ui/Tiles.tsx";
import Lobby from "../ui/Lobby.tsx";
import { DungeonMaster, SingleplayerDungeonMasterClient } from "../game/stuff/dungeon-master.ts";
export default function SingleplayerSandboxApp() {
    const [screen, setScreen] = useState(undefined as string[][] | undefined)
    const pov = useRef(undefined as SimulationPOV | undefined)
    const client = useRef(undefined as SingleplayerClient<SaturatedAction, SimulationWrapper> | undefined)
    useEffect(()=>{
        const [game, ids] = spawnPlayers(debugWorld(Simulation.build()), 1, [1,1])
        const wrapper = new SimulationWrapper(game, {playerEntityIds: ids})
        client.current = new SingleplayerClient(
            (nPlayers)=>{
                return wrapper;
            }, 
            (_)=>{
                updater.dispatchEvent(new Event("update"))
            }, 
            ()=>{
                pov.current = new SimulationPOV(client.current!)
                console.log(pov.current)
                listenForMovementInput(pov.current)
                const dungeonMaster = new DungeonMaster(new SingleplayerDungeonMasterClient(wrapper))
                setInterval(()=>{dungeonMaster.update()}, 500)
            }, 
            /*
            (f)=>{
                let last = performance.now()
                const delta = 1000/60
                const g = ()=>{
                    const now = performance.now()
                    if (now - last > delta) {
                        last += delta
                        f()
                    }
                    requestAnimationFrame(g)
                }
                g()
            }
            */
        )
    },[])
    const player = useGameState(()=>pov.current?.player, addUpdateListener)
    return <div>{pov.current ? <div>
            <Tiles pov={pov.current!} dimensions={[40, 20]}/>
            <Ui pov={pov.current!}/>
        </div>: null}
        </div>
}