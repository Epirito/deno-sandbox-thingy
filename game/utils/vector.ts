import mod from "./modulus.ts";
export function sum([x1, y1]: [number, number], [x2, y2]: [number, number])
    : [number, number] {
    return [x1 + x2, y1 + y2];
}
export function scalarMult(c: number, [x, y]: [number, number])
    : [number, number] {
    return [x * c, y * c];
}
export function equals([x1, y1]: [number, number], [x2, y2]: [number, number])
    : boolean {
    return x1 === x2 && y1 === y2;
}
export function rotatedBy([x, y]: [number, number], rightAngles: number)
    : [number, number] {
    switch (mod(rightAngles, 4)) {
        case 0:
            return [x, y];
        case 1:
            return [y, -x];
        case 2:
            return [-x, -y];
        default:
            return [-y, x];
    }
}
export function absPosition(
    attachedVector: [number, number], position: [number, number], rotation: number
): [number, number] {
    return sum(position, rotatedBy(attachedVector, rotation));
}