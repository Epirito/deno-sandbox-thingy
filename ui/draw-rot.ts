export class Drawing {
    draw() {
        document.querySelector('canvas')!.getContext('2d')!.fillText('Hello, world!', 0, 0)
    }
}