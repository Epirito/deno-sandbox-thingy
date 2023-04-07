import { Game, LockstepModel } from "./mod.ts";

interface TicTacToeState {
    board: string[][];
    t: number
  }
  
export class TicTacToe implements Game<number, TicTacToe> {
    state: TicTacToeState = {
      board: [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
      ],
      t: 0
    };
    currentPlayer() {
      return this.state.t % 2;
    }
    tick(moves: { player: number; action: number }[]) {
      moves.forEach((move) => {
        const row = Math.floor(move.action / 3);
        const col = move.action % 3;
        this.state.board[row][col] = move.player === 0 ? "X" : "O";
      });
      this.state.t += 1
    }
  
    copy() {
      const copy = new TicTacToe();
      copy.state = structuredClone(this.state);
      return copy;
    }
  
    get t() {
      return this.state.t;
    }
  }
  
  
  
  
  
  
  