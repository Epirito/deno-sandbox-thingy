export default {//to do: make this deterministic
    n: 1,
    next() {
        this.n++
        return (1.0 / this.n)
    }
}