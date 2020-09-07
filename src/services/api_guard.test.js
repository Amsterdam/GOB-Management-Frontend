import {guardRequest, JSONResponse, lastAPIError} from "./api_guard";
import {guardedGet} from "./api_guard";

beforeEach(() => {
    fetch.resetMocks();
});

it("guards API calls and stores last error", async () => {
    fetch.mockReject(() => Promise.reject("API is down"));

    const result = await guardedGet("some url", content => content)
    expect(result).toEqual({})
    expect(lastAPIError).toEqual({
        error: "API is down",
        text: 'API call "some url" failed'
    })
})

it("guards API calls and handles response errors", async () => {
    const mockSuccessResponse = {some: "response"};
    const mockJsonPromise = Promise.resolve(mockSuccessResponse);
    const mockFetchPromise = Promise.resolve({
        ok: true,
        json: () => mockJsonPromise,
    });
    jest.spyOn(global, 'fetch').mockImplementation(() => mockFetchPromise);

    const result = await guardedGet("some url", JSONResponse)

    expect(result).toEqual(mockSuccessResponse)
})

it("guards API calls and handles response errors", async () => {
    const mockFetchPromise = Promise.resolve({
        ok: false,
        statusText: "any error status text"
    });
    jest.spyOn(global, 'fetch').mockImplementation(() => mockFetchPromise);

    const result = await guardedGet("some url", content => content)
    expect(result).toEqual({})
    expect(lastAPIError).toEqual({
        error: "any error status text",
        text: 'API call "some url" failed'
    })
})

it("guards any request", async () => {
    let request = async () => "result"
    let result = await guardRequest(request)
    expect(result).toEqual("result")

    const error = "any error"

    request = async () => {
        throw error
    }
    result = await guardRequest(request)
    expect(result).toEqual({})
    expect(lastAPIError).toEqual({
        error,
        text: ''
    })
})
