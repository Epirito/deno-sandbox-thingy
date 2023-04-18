import { WORLDSIZE } from "../logic/constants.ts";
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
export function neighbors(idx: number) {
    return [idx+1, idx+WORLDSIZE, idx-1, idx-WORLDSIZE].filter(x=>x>=0 && x<WORLDSIZE**2)
}
export function pointInRect([x, y]: [number, number], [x1, y1]: [number, number], [x2, y2]: [number, number]) {
    return x>=x1 && x<x2 && y>=y1 && y<y2;
}
export function rectOutline([x1, y1]: [number, number], [x2, y2]: [number, number]) {
    const result = [] as [number, number][]
    for(let x = x1; x <= x2; x++) {
        result.push([x, y1])
        result.push([x, y2])
    }
    for(let y = y1+1; y < y2; y++) {
        result.push([x1, y])
        result.push([x2, y])
    }
    return result
}
export const hash = (pos: [number, number])=>pos.join(',')