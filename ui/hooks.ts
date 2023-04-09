import { useEffect, useRef, useState } from "preact/hooks";

export function useGameState<T>(getState: ()=>T, addUpdateListener: (listener: (e: Event)=>void)=>void, removeUpdateListener?: (listener: (e: Event)=>void)=>void) {
    const [state, setState] = useState(getState());
    useEffect(() => {
        const listener = () => setState(getState());
        addUpdateListener(listener);
        return () => {
            removeUpdateListener?.(listener);
        }
    }, []);
    return state;
}
export function useFocusedRef() {
    const ref = useRef(null as EventTarget | null);
    useEffect(() => {
        document.addEventListener('focusin', (e) => {
            ref.current = e.target;
        });
        document.addEventListener('focusout', (_) => {
            ref.current = null;
        }
        );
    }, []);
    return ref;
}
export function useDOMEvent<T extends keyof DocumentEventMap>(eventName: T, listener: (e: any) => void) {
    useEffect(() => {
        document.addEventListener(eventName, listener);
        return () => {
            document.removeEventListener(eventName, listener);
        }
    }, []);
}