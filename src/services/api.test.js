import {get_api, get_gob_api} from "./api";

beforeEach(() => jest.resetModules());

it("should provide for an api address when connecting to a local API", () => {
    jest.mock("./config", () => ({
        CONNECT_TO_LOCAL_API: true,
        PRODUCTION_API: 'any production api'
    }));
    const { get_api } = require("./api");

    const windowSpy = jest.spyOn(global, "window", "get");
    windowSpy.mockImplementation(() => ({
        location: {
            protocol: 'any protocol',
            hostname: 'any hostname'
        },
    }));

    expect(get_api()).toEqual("any protocol//any production api/")

    // localhost will point to 127.0.0.1
    windowSpy.mockImplementation(() => ({
        location: {
            protocol: 'any protocol',
            hostname: 'localhost'
        },
    }));

    expect(get_api()).toEqual("any protocol//127.0.0.1:8143/")

    windowSpy.mockImplementation(() => ({
        location: {
            protocol: 'any protocol',
            hostname: 'acc.iris.some-host'
        },
    }));

    expect(get_api()).toEqual("any protocol//acc.api.some-host/")

});

it("should provide for an api address when connecting to the acceptance API", () => {
    jest.mock("./config", () => ({
        CONNECT_TO_LOCAL_API: false,
        ACCEPTANCE_API: 'any acceptance api'
    }));
    const { get_api } = require("./api");

    const windowSpy = jest.spyOn(global, "window", "get");
    windowSpy.mockImplementation(() => ({
        location: {
            protocol: 'any protocol',
            hostname: 'any hostname'
        },
    }));

    expect(get_api()).toEqual("any acceptance api")
});

it("should provide for the GOB api address", () => {
    // Don't change an address without port number 8143
    let api = get_api()
    expect(get_gob_api()).toEqual(api)

    // localhost will point to 127.0.0.1
    const windowSpy = jest.spyOn(global, "window", "get");
    windowSpy.mockImplementation(() => ({
        location: {
            protocol: 'any protocol',
            hostname: 'localhost'
        },
    }));

    api = get_api()
    expect(get_gob_api()).toEqual("any protocol//127.0.0.1:8141/")
})
