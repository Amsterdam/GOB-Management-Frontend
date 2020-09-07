beforeEach(() => jest.resetModules());

it("provide the ordering of a queue", async () => {
    const mockGetQueues = jest.fn(async () => [
        {name: "gob.workflow.apply", messages_unacknowledged: 5},
        {name: "any other queue"},
        {name: "gob.log.logs"},
    ])
    const mockPurgeQueue = jest.fn()

    jest.mock("../../../services/gob", () => ({
        getQueues: mockGetQueues,
        purgeQueue: mockPurgeQueue
    }))

    const mockMemoize = jest.fn((m, t) => () => m())
    jest.mock("../../../services/utils", () => ({
        memoize: mockMemoize

    }))

    const {getQueues, getJobs, purgeQueue} = require("./queues")
    expect(await getQueues()).toEqual([
        {"display": "apply", "name": "gob.workflow.apply", "tooltip": "Apply events", "messages_unacknowledged": 5},
        {"display": "logs", "name": "gob.log.logs", "tooltip": "Regular log message"},
        {"display": "any other queue", "name": "any other queue", "tooltip": undefined},
    ])
    expect(mockGetQueues).toHaveBeenCalledWith()

    expect(await getJobs()).toEqual(5)
    expect(mockGetQueues).toHaveBeenCalledTimes(2)

    purgeQueue("any queue")
    expect(mockPurgeQueue).toHaveBeenCalledWith("any queue")
})