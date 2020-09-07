it("should tell if any db locks exist", () => {
    const mockGetDbLocks = jest.fn()
    const mockGetDbQueries = jest.fn()

    jest.mock("../../../services/gob_api", () => ({
        getDbLocks: mockGetDbLocks,
        getDbQueries: mockGetDbQueries
    }))

    const mockMemoize = jest.fn((m, t) => () => m())
    jest.mock("../../../services/utils", () => ({
        memoize: mockMemoize

    }))

    const {getDbLocks, getDbQueries} = require("./database")

    expect(mockMemoize).toHaveBeenCalledTimes(2)
    expect(mockMemoize).toHaveBeenCalledWith(mockGetDbLocks, 1500)
    expect(mockMemoize).toHaveBeenCalledWith(mockGetDbQueries, 1500)
    expect(mockGetDbLocks).not.toHaveBeenCalled()
    expect(mockGetDbQueries).not.toHaveBeenCalled()

    getDbLocks()
    expect(mockGetDbLocks).toHaveBeenCalled()
    expect(mockGetDbQueries).not.toHaveBeenCalled()

    getDbQueries()
    expect(mockGetDbQueries).toHaveBeenCalled()
})