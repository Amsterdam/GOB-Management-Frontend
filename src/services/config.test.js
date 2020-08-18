import {CONNECT_TO_LOCAL_API, TZ} from "./config";

it("should connect to the local API", () => {
    // Setting the configuration variable to false is only used for local testing
    // against the acceptance API
    expect(CONNECT_TO_LOCAL_API).toEqual(true)
});

it("should specify a local timezone string", () => {
    expect(typeof TZ).toBe('string')
});
