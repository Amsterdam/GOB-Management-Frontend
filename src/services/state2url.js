export function getSearch(history) {
    const search = history.location.search
    return new URLSearchParams(search)
}

export function getUrlParams(history, vars) {
    const params = getSearch(history)
    return vars.reduce((obj, variable) => {
        const value = params.get(variable)
        if (value) {
            obj[variable] = value
        }
        return obj
    }, {})
}

export function saveToUrl(history, vars) {
    let search = Object.keys(vars)
        .filter(v => vars[v])
        .reduce((obj, v) => ({
            ...obj,
            [v]: vars[v]
        }), {})
    search = "?" + new URLSearchParams(search)
    let hash = history.location.hash;
    history.replace({search, hash})
}

export async function history2state(history, stateVars, current) {
    const state = getUrlParams(history, Object.keys(stateVars))
    Object.entries(state).map(async ([key, value]) => {
        await stateVars[key](value)
    })
    state2history(history, stateVars, current)
}

export function state2history(history, stateVars, current, prev = {}) {
    const hasChanged = Object.keys(stateVars).reduce((result, v) => {
        return result || prev[v] !== current[v]
    }, false)

    if (hasChanged) {
        const state = Object.keys(stateVars).reduce((obj, v) => ({
            ...obj,
            [v]: current[v]
        }), {})
        saveToUrl(history, state)
    }
}
