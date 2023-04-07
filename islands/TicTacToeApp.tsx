import {useState, useRef, useEffect} from "preact/hooks"
import { TicTacToe } from "../multiplayer/tictactoe-example.ts";
import { LockstepModel } from "../multiplayer/lockstep-model.ts";

export default function TicTacToeApp() {
    const [started, setStarted] = useState(false)
    const [board, setBoard] = useState(null as string[][] | null)
    const play = useRef(undefined as ((action: number)=>void) | undefined)
    const lockstepModel = useRef(undefined as LockstepModel<number, TicTacToe> | undefined)
    useEffect(()=>{
        lockstepModel.current = new LockstepModel<number, TicTacToe>(
            () => new TicTacToe(),
            (state) => {
                setBoard(state.state.board)
            },
            (initialState) => {
                console.log("Game started!");
                play.current = (action: number)=>{
                    console.log('played')
                    lockstepModel.current!.playerInput(action)};
                setStarted(true)
            },
            "ws://localhost:3000"
          )
        }, [])
    return <div>
        <h1>Game</h1>
        <div>
        {board ? <div>
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
    </div>
}