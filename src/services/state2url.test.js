import {getSearch, getUrlParams, history2state, saveToUrl, state2history} from "./state2url";

it("manipulate the seatch parameters", async () => {
    const history = {
        location: {
            search: "q=value&n=1"
        }
    }
    expect(getSearch(history).get('q')).toEqual("value")
    expect(getSearch(history).get('n')).toEqual("1")

    expect(getUrlParams(history, ['q'])).toEqual({q: "value"})
    expect(getUrlParams(history, ['q', 'n'])).toEqual({q: "value", n: "1"})
    expect(getUrlParams(history, ['q', 'n', 'x'])).toEqual({q: "value", n: "1"})

    history.replace = jest.fn()
    const vars = {
        v1: "var1",
        v2: "var2"
    }
    saveToUrl(history, vars)
    expect(history.replace).toHaveBeenCalledWith({"search": "?v1=var1&v2=var2"})

    history.replace.mockClear()
    state2history(history, vars, vars, vars )
    expect(history.replace).not.toHaveBeenCalled()
    state2history(history, vars, vars )
    expect(history.replace).toHaveBeenCalledWith({"search": "?v1=var1&v2=var2"})

    history.replace.mockClear()
    await history2state(history, {q: "value", n: "1"}, {q: "othervalue", n: "0"})
    expect(history.replace).toHaveBeenCalledWith({"search": "?q=othervalue&n=0"})
})
