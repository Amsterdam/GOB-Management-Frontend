
it("should perform a GrahpQL request", async () => {
    let mockAuth = {token: jest.fn(async () => "any token")}
    jest.mock("./auth", () => mockAuth)

    let mockGraphQLClient = jest.fn().mockImplementation(() => {
        return {request: async query => query};
    });
    jest.mock("graphql-request", () => ({
        GraphQLClient: mockGraphQLClient
    }))

    let mockGuardRequest = jest.fn(async request => request())
    jest.mock("./api_guard", () => ({
        guardRequest: mockGuardRequest
    }))

    const {request} = require("./request")

    let result = await(request("any api", "any url"))
    expect(result).toEqual("any url")
    expect(mockGraphQLClient).toHaveBeenCalledWith("any api", {"headers": {"Authorization": "Bearer any token"}})

    // token is optional
    mockGraphQLClient.mockClear()
    mockAuth.token.mockImplementation(jest.fn(async () => null))
    result = await(request("any api", "any url"))
    expect(result).toEqual("any url")
    expect(mockGraphQLClient).toHaveBeenCalledWith("any api", {"headers": {}})
})

it("should perform a regular API request", async () => {
    let mockAuth = {token: jest.fn(async () => "any token")}
    jest.mock("./auth", () => mockAuth)

    const mockFetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            data: "any data"
        }))
    global.fetch = mockFetch

    const {get} = require("./request")

    let result = await get("any url", "any options")
    expect(result).toEqual({"data": "any data", "ok": true})

    result = await get("any url")
    expect(result).toEqual({"data": "any data", "ok": true})

    mockFetch.mockImplementation(jest.fn(() =>
        Promise.resolve({
            ok: false,
            data: "any data"
        })))
    result = null
    try {
        result = await get("any url", "any options")
        expect(true).toEqual(false)
    } catch (err) {
        expect(result).toEqual(null)
    }
})