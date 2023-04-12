import {useState, useRef, useEffect} from "preact/hooks"
//import { TicTacToe } from "../multiplayer/tictactoe-example.ts";
//import { LockstepClient } from "../multiplayer/lockstep-model.ts";
import {LockstepClient, TicTacToe, BasicModel } from "modularMultiplayer"
import { useGameState } from "../ui/hooks.ts"
export default function TicTacToePage() {
    const [board, setBoard] = useState(undefined as string[][] | undefined)
    const play = useRef(undefined as ((action: number)=>void) | undefined)
    const lockstepModel = useRef(undefined as LockstepClient<number, TicTacToe> | undefined)
    
    useEffect(()=>{
        lockstepModel.current = new LockstepClient<number, TicTacToe>(
            (nPlayers)=>new BasicModel(new TicTacToe(),nPlayers),
            (_) => {
                console.log(lockstepModel.current?.renderable.state.board)
                setBoard([...lockstepModel.current?.renderable.state.board!])
            },
            () => {
                console.log("Game started!");
                play.current = (action: number)=>{
                    console.log('played')
                    lockstepModel.current!.playerInput(action)
                };
            },
            "ws://localhost:3000"
          )
        }, [])
    return <div>
        <h1>Game</h1>
        {board ? <div>{console.log(board)}
            {board.map((row, i) => {
                return <div>{row.join('')}</div>    
            })}
            <button onClick={()=>{play.current!(0)}}>0</button>
            <button onClick={()=>{play.current!(1)}}>1</button>
            <button onClick={()=>{play.current!(2)}}>2</button>
            <button onClick={()=>{play.current!(3)}}>3</button>
            <button onClick={()=>{play.current!(4)}}>4</button>
            <button onClick={()=>{play.current!(5)}}>5</button>
            <button onClick={()=>{play.current!(6)}}>6</button>
            <button onClick={()=>{play.current!(7)}}>7</button>
            <button onClick={()=>{play.current!(8)}}>8</button>
        </div> : <div>Waiting for game to start</div>}
    </div>
}