export function memoize(method, msec=Number.MAX_SAFE_INTEGER) {
    let cache = {}

    return async function() {
        let args = JSON.stringify(arguments)
        let now = new Date()

        if (cache[args]) {
            let age = now.getTime() - cache[args].timestamp.getTime()
            if (age >= msec) {
                delete cache[args]
            }
        }

        cache[args] = cache[args] || {
            timestamp: now,
            result: method.apply(this, arguments)
        }
        return cache[args].result
    }
}
