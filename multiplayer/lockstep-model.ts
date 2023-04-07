import { Game } from "./game.ts"
import { Model, Player } from "./model.ts"

export class LockstepModel<T, K extends Game<T, K>> {
    model?: Model<T, K>
    private socket!: WebSocket
    private playerObj?: Player<T>
    get player() {
      return this.playerObj?.id
    }
    constructor(initGame: (nPlayers: number)=>K, private render: (state: K)=>void, private onStart: (initialState: K)=>void, serverURL: string, fps=60) {
      this.socket = new WebSocket(serverURL)
      this.socket.onopen = ()=>{setTimeout(this.ready, 3000)}
      this.socket.onmessage = (e: MessageEvent) => {
        const parsed = JSON.parse(e.data) as {type: string, msg: any}
        switch(parsed.type) {
          case "start": {
            const msg = parsed.msg as {id: number, nPlayers: number}
            this.model = new Model(initGame, msg.nPlayers)
            this.playerObj = this.model.players[msg.id]
            this.onStart(this.model.authoritative)
            setInterval(() => {
              while(this.model!.players.reduce((y, x)=>x.furthestUpdateT > y.furthestUpdateT ? x : y).id!==this.player!) {
                this.tick(null, false)
              }
              this.tick(null)
            }, 1000 / fps)
          break;
          }
          case "moved": {
            const msg = parsed.msg as {player: number, move: T, t: number}
            if (msg.player === this.player) return;
            this.model!.receiveAction(msg.player, msg.move, msg.t, false)
          }
          break;
          case "meta": {
            const msg = parsed.msg as {type: string, player: number, t: number}
            this.model!.receiveMetaAction(msg.type, msg.player, msg.t)
          }
        }
      }
    }
    ready = ()=> {
      this.socket.send("ready")
    }
    playerInput(input: T | null) {
      this.tick(input)
    }
    private sendJSON(data: any) {
      this.socket.send(JSON.stringify(data))
    }
    private tick(move: T | null, render=true) {
      const t = this.model!.prediction.t
      this.sendJSON({type: "moved", msg: {move, t}})
      this.model!.receiveAction(this.player!, move, t)
      if (render) this.render(this.model!.prediction)
    }
  }