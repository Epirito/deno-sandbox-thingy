export const updater = new EventTarget()
export const addUpdateListener = (listener: (e: Event)=>void) => {updater.addEventListener('update', listener)}