import {get_gob_api} from "./api";
import {guardedGet, JSONResponse} from "./api_guard";

import {getDbLocks, getDbQueries} from "./gob_api";

jest.mock("./api")
jest.mock("./api_guard")

const mockAPI = "mockAPI"
const mockGuardedGet = "mockGuardedGet"

beforeEach(() => {
    get_gob_api.mockReturnValue(mockAPI)
    guardedGet.mockReturnValue(mockGuardedGet)
})

it("should call the GOB API and return the guarded get response for locks", async () => {
    const locks = await getDbLocks()
    expect(guardedGet).toHaveBeenCalledWith(`${mockAPI}gob/info/locks`, JSONResponse)
    expect(locks).toBe(mockGuardedGet)
})

it("it should call the GOB API and return the guarded get response for queries", async () => {
    const queries = await getDbQueries()
    expect(guardedGet).toHaveBeenCalledWith(`${mockAPI}gob/info/activity`, JSONResponse)
    expect(queries).toBe(mockGuardedGet)
})
