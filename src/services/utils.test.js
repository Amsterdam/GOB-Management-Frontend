import MockDate from 'mockdate'
import {memoize} from "./utils";

it("should memoize method results for a maximum number of seconds", async () => {
    let nRealCalls = 0

    function double(n) {
        nRealCalls++;
        return 2 * n
    }
    let m = memoize(n => double(n), 2000)

    MockDate.set(new Date('2020', 1, 1, 12, 0, 0).toISOString())
    expect(await m(5)).toBe(10)
    expect(nRealCalls).toBe(1)
    await m(5)
    await m(5)
    expect(nRealCalls).toBe(1)

    MockDate.set(new Date('2020', 1, 1, 12, 0, 1).toISOString())
    expect(await m(5)).toBe(10)
    expect(nRealCalls).toBe(1)

    MockDate.set(new Date('2020', 1, 1, 12, 0, 2).toISOString())
    expect(await m(5)).toBe(10)
    expect(nRealCalls).toBe(2)

    MockDate.set(new Date('2020', 1, 1, 12, 0, 30).toISOString())
    expect(await m(5)).toBe(10)
    expect(nRealCalls).toBe(3)

    expect(await m(10)).toBe(20)
    expect(nRealCalls).toBe(4)  // Other arguments!
})