import { BasicModel, LockstepModel } from "modularMultiplayer";
import { debugWorld, spawnPlayers } from "../game/stuff/world-gen.ts";
import { useEffect, useRef, useState } from "preact/hooks";
import Simulation, { SimulationWrapper } from "../game/logic/simulation.ts";
import { Model } from "modularMultiplayer";
import { PhysicsSystem, SaturatedAction, SimulationPOV } from "../game/mod.ts";
import { useGameState } from "../ui/hooks.ts";
import { listenForMovementInput } from "../ui/inputs.ts";
import { addUpdateListener, updater } from "../ui/screen-update.ts";
import Ui from "../ui/Ui.tsx";
import Tiles from "../ui/Tiles.tsx";
import Lobby from "../ui/Lobby.tsx";

export default function SandboxApp() {
    const [screen, setScreen] = useState(undefined as string[][] | undefined)
    const pov = useRef(undefined as SimulationPOV | undefined)
    const lockstep = useRef(undefined as LockstepModel<SaturatedAction, SimulationWrapper> | undefined)
    const onReady = ()=>{
        // lazy load the lockstep model
        lockstep.current!.ready()
    }
    useEffect(()=>{
        lockstep.current = new LockstepModel((nPlayers)=>{
            const [game, ids] = spawnPlayers(debugWorld(Simulation.build()), nPlayers, [1,1])
            return new BasicModel(new SimulationWrapper(game, {playerEntityIds: ids}), nPlayers) as Model<SaturatedAction, SimulationWrapper>
        }, (_)=>{
            updater.dispatchEvent(new Event("update"))
        }, ()=>{
            pov.current = new SimulationPOV(lockstep.current!)
            listenForMovementInput(pov.current)
        },
        "ws://localhost:3000")
    },[])
    const player = useGameState(()=>pov.current?.player, addUpdateListener)
    return <div>
        {player ? <div>
            <Tiles pov={pov.current!}/>
            <Ui pov={pov.current!}/>
        </div> : <Lobby onReady={onReady}/>}
    </div>
}