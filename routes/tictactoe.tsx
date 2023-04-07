import { useRef, useState } from "preact/hooks"
import { LockstepModel } from "../multiplayer/mod.ts";
import { TicTacToe } from "../multiplayer/tictactoe-example.ts";
import TicTacToeApp from "../islands/TicTacToeApp.tsx";

export default function TictactoeRoute() {
    return <div><TicTacToeApp/></div>
}