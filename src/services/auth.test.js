import {runsLocally, runsOnTest, runsOnAcceptance, runsOnProduction} from "./auth"

beforeEach(() => jest.resetModules());

it("can tell in which environment it runs", () => {
    const windowSpy = jest.spyOn(global, "window", "get");
    windowSpy.mockImplementation(() => ({
        location: {
            hostname: 'localhost'
        },
    }));

    expect(runsLocally()).toEqual(true)
    expect(runsOnTest()).toEqual(false)
    expect(runsOnAcceptance()).toEqual(false)
    expect(runsOnProduction()).toEqual(false)

    windowSpy.mockImplementation(() => ({
        location: {
            hostname: 'some.test.env'
        },
    }));

    expect(runsLocally()).toEqual(false)
    expect(runsOnTest()).toEqual(true)
    expect(runsOnAcceptance()).toEqual(false)
    expect(runsOnProduction()).toEqual(false)

    windowSpy.mockImplementation(() => ({
        location: {
            hostname: 'some.acc.env'
        },
    }));

    expect(runsLocally()).toEqual(false)
    expect(runsOnTest()).toEqual(false)
    expect(runsOnAcceptance()).toEqual(true)
    expect(runsOnProduction()).toEqual(false)

    windowSpy.mockImplementation(() => ({
        location: {
            hostname: 'some.env'
        },
    }));

    expect(runsLocally()).toEqual(false)
    expect(runsOnTest()).toEqual(false)
    expect(runsOnAcceptance()).toEqual(false)
    expect(runsOnProduction()).toEqual(true)
})

it("Supports keycloak authorization locally", async () => {
    const keycloak = {
        init: jest.fn(async (options) => options),
        token: "any token",
        login: jest.fn(),
        logout: jest.fn(),
        loadUserInfo: jest.fn(() => "user info"),
        updateToken: jest.fn()
    }

    const windowSpy = jest.spyOn(global, "window", "get");
    windowSpy.mockImplementation(() => ({
        Keycloak: config => keycloak,
        location: {
            hostname: 'localhost'
        },
    }));

    const setupKeycloack = require("./auth").default

    const token = await setupKeycloack.token()
    expect(keycloak.init).toHaveBeenCalledWith({
        "check-sso": false,
        "checkLoginIframe": false,
        "promiseType": "native"})
    expect(token).toEqual("any token")
    expect(setupKeycloack.isAdmin()).toEqual(true)

    expect(keycloak.login).not.toHaveBeenCalled()
    expect(keycloak.logout).not.toHaveBeenCalled()

    await setupKeycloack.login()
    expect(keycloak.login).toHaveBeenCalled()
    expect(keycloak.logout).not.toHaveBeenCalled()

    await setupKeycloack.logout()
    expect(keycloak.logout).toHaveBeenCalled()

    let userInfo = await setupKeycloack.userInfo()
    expect(userInfo).toEqual(null)

    keycloak.authenticated = true
    userInfo = await setupKeycloack.userInfo()
    expect(userInfo).toEqual("user info")
    expect(keycloak.loadUserInfo).toHaveBeenCalledWith()

    keycloak.onReady("authenticated")
    keycloak.onAuthSuccess()
    keycloak.onAuthError()
    keycloak.onAuthRefreshSuccess()
    keycloak.onAuthRefreshError()
    keycloak.onAuthLogout()
    keycloak.onTokenExpired()

})

it("Supports keycloak authorization on production", async () => {
    const keycloak = {
        init: jest.fn(async (options) => options),
        token: "any token",
        login: jest.fn(),
        logout: jest.fn()
    }

    const windowSpy = jest.spyOn(global, "window", "get");
    windowSpy.mockImplementation(() => ({
        Keycloak: config => keycloak,
        location: {
            hostname: 'any host'
        },
    }));
    keycloak.init.mockClear()

    const setupKeycloack = require("./auth").default

    const token = await setupKeycloack.token()
    expect(keycloak.init).toHaveBeenCalledWith({
        "check-sso": false,
        "checkLoginIframe": false,
        "onLoad": "login-required",
        "promiseType": "native"})
    expect(token).toEqual("any token")
    expect(setupKeycloack.isAdmin()).toEqual(false)
})

it("Supports keycloak roles", async () => {
    const keycloak = {
        init: jest.fn(async (options) => options),
        token: "any token",
        login: jest.fn(),
        logout: jest.fn(),
        updateToken: jest.fn()
    }

    const windowSpy = jest.spyOn(global, "window", "get");
    windowSpy.mockImplementation(() => ({
        Keycloak: config => keycloak,
        location: {
            hostname: 'any host'
        },
    }));
    keycloak.init.mockClear()

    const mockJwtDecode = jest.fn(token => ({realm_access: {roles: ["gob_adm"]}}))
    jest.mock("jwt-decode", () => mockJwtDecode)

    const setupKeycloack = require("./auth").default

    jest.useFakeTimers();

    expect(setupKeycloack.isAdmin()).toEqual(true)
    keycloak.onAuthSuccess()
    expect(keycloak.logout).not.toHaveBeenCalled()
    expect(setInterval).toHaveBeenCalled()
    jest.runOnlyPendingTimers();
    expect(keycloak.updateToken).toHaveBeenCalled()
    keycloak.onAuthError()

    mockJwtDecode.mockImplementation(token => ({realm_access: {roles: ["xgob_adm"]}}))
    expect(setupKeycloack.isAdmin()).toEqual(false)
    keycloak.onAuthSuccess()
    expect(keycloak.logout).toHaveBeenCalled()

    mockJwtDecode.mockImplementation(token => ({realm_access: {}}))
    expect(setupKeycloack.isAdmin()).toEqual(false)
})
