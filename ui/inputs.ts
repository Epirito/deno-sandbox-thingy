import { SimulationPOV, shoot, walk } from "../game/mod.ts"

export function listenForMovementInput(pov: SimulationPOV) {
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
        pov.playerAction(walk.iota, [], {rotation})
    })
}