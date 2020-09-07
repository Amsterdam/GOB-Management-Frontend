import {BRUTO, NETTO, defaultOrdering} from "./dashboard";

it("should provide for dashboard constants", () => {
    expect(typeof BRUTO).toBe('string')
    expect(typeof NETTO).toBe('string')
    defaultOrdering.forEach(process => expect(typeof process).toBe('string'))
})