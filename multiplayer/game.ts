export interface Game<T, K extends Game<T,K>> {
    tick(moves: { player: number; action: T }[]): void;
    copy(): K;
    get t(): number;
}