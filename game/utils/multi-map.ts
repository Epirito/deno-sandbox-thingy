export default class MultiMap<T,K> {
    private map = new Map<T, K[]>()
    set(key: T, value: K) {
        const arr = this.map.get(key) ?? []
        arr.push(value)
        this.map.set(key, arr)
    }
    remove(key: T, value: K) {
        const arr = this.map.get(key) ?? []
        const index = arr.indexOf(value)
        if (index !== -1) {
            arr.splice(index, 1)
        }
        this.map.set(key, arr)
    }
    delete(key: T) {
        this.map.delete(key)
    }
    get(key: T) {
        return [...this.map.get(key) ?? []]
    }
    forEach(cb: (values: K[], key: T)=>void) {
        this.map.forEach((values, key)=>{
            cb(values, key)
        })
    }
}