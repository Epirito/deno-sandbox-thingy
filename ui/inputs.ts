import { SimulationPOV, walk } from "../game/mod.ts"

export function listenForMovementInput(pov: SimulationPOV) {
    document.addEventListener('keydown', (e) => {
        let rotation: number | undefined = undefined
        switch(e.key) {
        case 'd':
            rotation = 0
        break
        case 'w':
            rotation = 1
        break
        case 'a':
            rotation = 2
        break
        case 's':
            rotation = 3
        break
        }
        if (rotation===undefined) {
        return
        }
        pov.playerAction(walk.iota, [], {rotation})
    })
}