import {aggregationTitles, filterJobs, filterName, filterTypes, getState, MESSAGE_TYPES} from "./jobs";

beforeEach(() => jest.resetModules());

it("should provide for constants", () => {
    expect(typeof MESSAGE_TYPES).toBe('string')
    filterTypes.forEach(filterType => {
        expect(typeof filterType.text).toBe('string')
        expect(typeof filterType.key).toBe('string')
        expect(typeof filterType.defaultOpen).toBe('boolean')
    })
    Object.values(aggregationTitles).forEach(title => {
        expect(typeof title).toBe('string')
    })
})

it("provides for the name of a filter value", () => {
    expect(filterName("")).toBe("")
    expect(filterName("AaP")).toBe("aap")
    expect(filterName("AaP NooT")).toBe("aap noot")
    expect(filterName("AaP_NooT_mieS")).toBe("aap noot mies")
})

it("converts properties to a state", () => {
    const props = {
        currentJob: {
            jobid: "any current jobid"
        },
        currentProcessId: "any current processId",
        filter: {}
    }
    expect(getState(props)).toEqual({
        jobid: "any current jobid",
        processid: "any current processId"
    })

    props.filter = {
        key1: "",
        key2: "value"
    }
    expect(getState(props)).toEqual({
        jobid: "any current jobid",
        processid: "any current processId",
        key2: "value"
    })
})

it("filters job given a filter", () => {
    const jobs = [{
        key1: "value1",
        isoStarttime: "2020-04-20T11:31:25.819Z",
        errors: 0,
        warnings: 5
    }]
    const filter = {}
    expect(filterJobs(jobs, filter)).toEqual(jobs)
    filter.key1 = ["value1"]
    expect(filterJobs(jobs, filter)).toEqual(jobs)
    filter.key1 = []
    expect(filterJobs(jobs, filter)).toEqual(jobs)
    filter.key1 = ["any value", "value1"]
    expect(filterJobs(jobs, filter)).toEqual(jobs)
    filter.key1 = ["any other value"]
    expect(filterJobs(jobs, filter)).toEqual([])
    filter.key1 = ["value1"]
    filter.year = [2018]
    expect(filterJobs(jobs, filter)).toEqual([])
    filter.year = [2018, 2019, 2020]
    expect(filterJobs(jobs, filter)).toEqual(jobs)
    filter.messageTypes = []
    expect(filterJobs(jobs, filter)).toEqual(jobs)
    filter.messageTypes = ['errors']
    expect(filterJobs(jobs, filter)).toEqual([])
    filter.messageTypes = ['errors', 'warnings']
    expect(filterJobs(jobs, filter)).toEqual(jobs)
    filter.messageTypes = ['warnings']
    expect(filterJobs(jobs, filter)).toEqual(jobs)
})

it("should load jobs", async () => {
    const mockGetJobs = jest.fn(async filter => "any jobs")
    jest.mock("../../../services/gob", () => ({
        getJobs: mockGetJobs
    }))

    const { loadJobs } = require("./jobs")

    let jobs = await loadJobs("any filter")
    expect(jobs).toEqual("any jobs")
    expect(mockGetJobs).toHaveBeenCalledWith("any filter")

    jobs = await loadJobs()
    expect(jobs).toEqual("any jobs")
    expect(mockGetJobs).toHaveBeenCalledWith({daysAgo: 7})
})