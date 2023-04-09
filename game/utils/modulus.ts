export default function mod(x: number, y: number) {
    return ((x % y) + y) % y;
}