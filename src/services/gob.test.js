import moment from "moment"
import MockDate from 'mockdate'
import {addDurations, jobProcess, enrichJob} from "./gob"

beforeEach(() => jest.resetModules());

it("should provide data sources", async () => {
    const mockSources = async () => ({
        sourceEntities: [
            {source: 'a'},
            {source: 'b'},
            {source: 'c'},
            {source: 'a'},
        ]
    })
    jest.mock("../graphql/queries", () => ({
        querySourceEntities: async () => mockSources()
    }))
    const { sources } = require("./gob")

    const result = await sources()
    expect(result).toEqual(['a','b','c'])
})

it("should provide catalogs", async () => {
    const mockSources = async () => ({
        sourceEntities: [
            {catalogue: 'a'},
            {catalogue: 'b'},
            {catalogue: null},
            {catalogue: ''},
            {catalogue: 'a'},
        ]
    })
    jest.mock("../graphql/queries", () => ({
        querySourceEntities: async () => mockSources()
    }))
    const { getCatalogs } = require("./gob")

    const result = await getCatalogs()
    expect(result).toEqual(['a','b'])
})

it("should provide entities", async () => {
    const mockSources = async () => ({
        sourceEntities: [
            {entity: 'e1', source: 1, catalogue: 'a'},
            {entity: 'e1', source: 1, catalogue: 'b'},
            {entity: 'e1', source: 2, catalogue: 'c'},
            {entity: 'e1', source: 3, catalogue: 'd'},
            {entity: 'e1', source: 1, catalogue: null},
            {entity: 'e1', source: 1, catalogue: ''},
            {entity: 'e1', source: 1, catalogue: 'a'},
            {entity: 'e2', source: 1, catalogue: 'a'},
            {entity: 'e2', source: 1, catalogue: 'a'},
            {entity: 'e3', source: 1, catalogue: 'a'},
            {entity: 'e4', source: 2, catalogue: 'a'},
        ]
    })
    jest.mock("../graphql/queries", () => ({
        querySourceEntities: async () => mockSources()
    }))
    const { entities } = require("./gob")

    let result = await entities(1, 'a')
    expect(result).toEqual([
        {entity: 'e1', source: 1, catalogue: 'a'},
        {entity: 'e2', source: 1, catalogue: 'a'},
        {entity: 'e3', source: 1, catalogue: 'a'}
    ])

    result = await entities()
    expect(result).toEqual([
        {entity: 'e1', source: 1, catalogue: 'a'},
        {entity: 'e2', source: 1, catalogue: 'a'},
        {entity: 'e3', source: 1, catalogue: 'a'},
        {entity: 'e4', source: 2, catalogue: 'a'}
    ])
})

it("should provide logdays", async () => {
    const mockLogDays = async (s, c, e) => ({
        logDays: [s, c, e, 1]
    })
    jest.mock("../graphql/queries", () => ({
        queryLogDays: async (s, c, e) => mockLogDays(s, c, e)
    }))
    const { logDays } = require("./gob")

    const result = await logDays(1, 'a', 'e1')
    expect(result).toEqual([1, 'a', 'e1', 1])
})

it("should provide logs", async () => {
    const datalogs = [
        {'log': 1},
        {'log': 2}
    ]
    const mockLogs = async (data) => ({
        logs: {
            edges: [
                {
                    node: {
                        data: JSON.stringify(JSON.stringify(datalogs)),
                    }
                }
            ]
        }
    })
    const mockQueries = jest.fn(async (s, c, e) => mockLogs(s + c + e))
    const mockQueriesJob = jest.fn(async (j) => mockLogs(j))
    const mockQueriesJobStep = jest.fn(async (j, s) => mockLogs(j + s))
    jest.mock("../graphql/queries", () => ({
        queryLogs: mockQueries,
        queryLogsForJob: mockQueriesJob,
        queryLogsForJobStep: mockQueriesJobStep,
    }))
    const { logs, logsForJob, logsForJobStep } = require("./gob")

    let result = await logs('any source', 'any catalogue', 'any entity')
    expect(result).toEqual([{data: datalogs}])
    expect(mockQueries).toHaveBeenCalledWith('any source', 'any catalogue', 'any entity')

    result = await logsForJob('any jobid')
    expect(result).toEqual([{data: datalogs}])
    expect(mockQueriesJob).toHaveBeenCalledWith('any jobid')

    result = await logsForJobStep('any jobid', 'any stepid')
    expect(result).toEqual([{data: datalogs}])
    expect (mockQueriesJobStep).toHaveBeenCalledWith('any jobid', 'any stepid')
})

it("should provide job", async () => {
    let mockJob = jest.fn(async id => ({
        jobinfo: [{
            id
        }]
    }))
    jest.mock("../graphql/queries", () => ({
        queryJob: mockJob
    }))
    const { getJob } = require("./gob")

    let result = await getJob([1, 2, 3])
    expect(result).toEqual({"args": [], "id": [1, 2, 3]})

    result = await getJob([2, 3])
    expect(result).toEqual({"args": [], "id": [2, 3]})

    result = await getJob(null)
    expect(result).toEqual({"args": [], "id": null})
})

it("recognizes dump jobs", async () => {
    let mockJob = jest.fn(async () => ({
        jobinfo: [{
            id: 'any id',
            args: "['a', 'Database', 'b']",
            type: "export"
        }]
    }))
    jest.mock("../graphql/queries", () => ({
        queryJob: mockJob
    }))
    const { getJob } = require("./gob")

    let result = await getJob()
    expect(result).toEqual({
        args: ["a", "Database", "b"],
        id: "any id",
        type: "dump"
    })
})

it("handles empty job responses", async () => {
    jest.mock("../graphql/queries", () => ({
        queryJob: () => ({data: null})
    }))
    const { getJob } = require("./gob")

    let result = await getJob()
    expect(result).toEqual(null)
})

it("should provide catalog collections", async () => {
    let mockGet = jest.fn(async url => ({ok: false}))
    jest.mock("./request", () => ({get: mockGet}))

    const { getCatalogCollections } = require("./gob")
    let result = await getCatalogCollections()
    expect(result).toEqual([])

    mockGet.mockImplementation(async url => ({ok: true, json: () => "any result"}))
    result = await getCatalogCollections()
    expect(result).toEqual("any result")
})

it("should provide purge queue functionality", async () => {
    let mockGet = jest.fn(async (url, options) => ({ok: "ok status"}))
    jest.mock("./request", () => ({get: mockGet}))

    const {purgeQueue} = require("./gob")
    let result = await purgeQueue({name: "any queue"})
    expect(result).toEqual("ok status")
    expect(mockGet).toHaveBeenCalledWith(
        "gob_management/queue/any queue",
        {"method": "DELETE"})
})

it("should provide for delete job functionality", async () => {
    let mockGet = jest.fn(async (url, options) => ({ok: "ok status"}))
    jest.mock("./request", () => ({get: mockGet}))

    const {deleteJob} = require("./gob")
    let result = await deleteJob({jobid: "any jobid"})
    expect(result).toEqual("ok status")
    expect(mockGet).toHaveBeenCalledWith(
        "gob_management/job/any jobid",
        {"method": "DELETE"})
})

it("should provide for create job functionality", async () => {
    let mockGet = jest.fn(async (url, options) => ({ok: "ok status", text: () => "any text"}))
    jest.mock("./request", () => ({get: mockGet}))

    const {createJob} = require("./gob")
    let action = "any action"
    let catalogue = "any catalogue"
    let collection = "any collection"
    let product = "any product"
    let user = "any user"
    let result = await createJob(action, catalogue, collection, product, user)
    expect(result).toEqual({"ok": "ok status", "text": "any text"})
    let expectedBody = {
        action: "any_action",   // underscore in action!
        catalogue,
        collection,
        destination: "Objectstore",
        product,
        attribute: product,
        user
    }
    expect(mockGet).toHaveBeenCalledWith(
        "gob_management/job/",
        {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(expectedBody),
            method: "POST"
        })

    collection = null
    product = null
    user = null
    result = await createJob(action, catalogue, collection, product, user)
    expectedBody = {
        action: "any_action",   // underscore in action!
        catalogue,
        collection,
        destination: "Objectstore",
        product,
        attribute: product,
        user
    }
    expect(mockGet).toHaveBeenCalledWith(
        "gob_management/job/",
        {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(expectedBody),
            method: "POST"
        })


    mockGet.mockClear()
    action = "relate"   // => update mode (not full mode!)
    result = await createJob(action, catalogue, collection, product, user)
    expect(mockGet).toHaveBeenCalledWith(
        "gob_management/job/",
        {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({...expectedBody, action, mode: "update"}),
            method: "POST"
        })

    mockGet.mockClear()
    action = "dump" // => export to database
    result = await createJob(action, catalogue, collection, product, user)
    expect(mockGet).toHaveBeenCalledWith(
        "gob_management/job/",
        {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({...expectedBody, action: "export", destination: "Database"}),
            method: "POST"
        })

    mockGet.mockClear()
    mockGet.mockImplementation(jest.fn(async (url, options) => ({ok: false, text: () => "any test"})))
    action = "any action"
    result = await createJob(action, catalogue, collection, product, user)
    expect(result).toEqual({"ok": false, "text": "Start van any_action mislukt"})
})

it("should tell if a job is a zombie job", () => {
    const {isZombie} = require("./gob")

    // 11 hours is still OK
    let job = {
        status: "started",
        isoStarttime: moment(new Date()).subtract(11, 'hours').toISOString()
    }
    expect(isZombie(job)).toEqual(false)

    // 13 hours is too long
    job = {
        status: "started",
        isoStarttime: moment(new Date()).subtract(13, 'hours').toISOString()
    }
    expect(isZombie(job)).toEqual(true)

    // only for started jobs
    job = {
        status: "any status",
        isoStarttime: moment(new Date()).subtract(13, 'hours').toISOString()
    }
    expect(isZombie(job)).toEqual(false)

})

it("should provide jobs", async () => {
    // Request jobs, pass the filter
    const mockJobs = jest.fn(async () => ({jobs: []}))
    jest.mock("../graphql/queries", () => ({
        queryJobs: async () => mockJobs()
    }))
    const { getJobs } = require("./gob")
    expect(await getJobs("any filter")).toEqual([])

    // two jobs => 1 process with 2 jobs
    mockJobs.mockImplementation(jest.fn(async () => ({jobs: [{}, {}]})))
    let result = await getJobs("any filter")
    expect(result.length).toEqual(3)    // job + process
    expect(result[0].jobs[0]).toEqual(result[1])  // proces before its jobs
    expect(result[0].jobs[1]).toEqual(result[2])  // proces before its jobs
    expect(result[0].jobs.length).toEqual(2)    // process has two jobs
})

it("should calculate duration in seconds", () => {
    const {getDurationSecs} = require("./gob")

    // Default try to use duration
    expect(getDurationSecs("00:01:10")).toEqual(70)
    expect(getDurationSecs("25:00:00")).toEqual(25 * 60 * 60)

    // Invalid duration => calculate using start- and endtime
    expect(getDurationSecs("01:10",
        new Date(2011, 10, 5, 14, 55, 0),
        new Date(2011, 10, 5, 15, 55, 5))).toEqual(3605)

    // No duration => return a default answer
    expect(getDurationSecs()).toEqual(300)
})

it("should determine if a job runs on a given date", () => {
    const {jobRunsOnDate} = require("./gob")

    const dayBefore = new Date(2020, 6, 14, 14, 0, 0)
    const day = new Date(2020, 6, 15, 14, 0, 0)
    const dayAfter = new Date(2020, 6, 16, 14, 0, 0)

    let job = {
        starttime: new Date(2020, 6, 15, 11, 0, 0).toUTCString(),
        endtime: new Date(2020, 6, 15, 13, 0, 1).toUTCString()
    }
    expect(jobRunsOnDate(job, dayBefore)).toEqual(false)
    expect(jobRunsOnDate(job, day)).toEqual(true)
    expect(jobRunsOnDate(job, dayAfter)).toEqual(false)

    delete job.endtime
    expect(jobRunsOnDate(job, day)).toEqual(true)
})

it("should provide queues", async () => {
    let mockGet = jest.fn(async url => ({ok: false}))
    jest.mock("./request", () => ({get: mockGet}))

    const {getQueues} = require("./gob")

    expect(await getQueues()).toEqual([])

    mockGet.mockImplementation(jest.fn(async url => ({ok: true, json: () => "json"})))
    expect(await getQueues()).toEqual("json")
})

it("should format a data", () => {
    const {formatDate} = require("./gob")

    expect(formatDate("2020-04-20T11:31:25.819Z")).toEqual("Mo 20-04")
})

it("should provide unique values for key in list of objects", () => {
    const {uniqueValues} = require("./gob")

    const objs = [
        {a: 1, b: 2},
        {a: 1, b: 3},
        {a: 2, b: 2},
        {a: 2, b: 4},
        {a: 1, b: 2},
        {a: 3, b: 9},
    ]
    expect(uniqueValues(objs, 'a')).toEqual([1, 2, 3])
})

it("should provide job summaries", async () => {
    const {getJobsSummary} = require("./gob")

    const jobs = [
        {
            jobId: 1,
            starttime: "starttime",
            isoStarttime: "2020-04-20T11:31:25.819Z",
            catalogue: "cata",
            name: "namea",
            brutoSecs: 1,
            nettoSecs: 2,
            errors: 3
        },
        {
            jobId: 2,
            starttime: "starttime",
            isoStarttime: "2020-05-20T11:31:25.819Z",
            catalogue: "cata",
            name: "namea",
            brutoSecs: 1,
            nettoSecs: 2,
            errors: 3
        },
        {
            jobId: 3,
            starttime: "starttime",
            isoStarttime: "2020-03-20T11:31:25.819Z",
            catalogue: "cata",
            name: "namea",
            brutoSecs: 1,
            nettoSecs: 2
        },
        {
            jobId: 1,
            starttime: "starttime",
            isoStarttime: "2020-04-20T11:31:25.819Z",
            catalogue: "cata",
            name: "namea",
            brutoSecs: 1,
            nettoSecs: 2,
            errors: 3
        }
    ]
    const expectResult = {
        "cata": {
            "Fr 20-03": {
                "namea": {
                    "bruto_total": 1,
                    "jobs": [{
                        "jobId": 3,
                        "catalogue": "cata",
                        "isoStarttime": "2020-03-20T11:31:25.819Z",
                        "name": "namea",
                        "brutoSecs": 1,
                        "nettoSecs": 2,
                        "starttime": "starttime"
                    }],
                    "netto_total": 2,
                    "total_jobs": 1,
                    "with_errors": 0
                }
            },
            "Mo 20-04": {
                "namea": {
                    "bruto_total": 1,
                    "jobs": [{
                        "jobId": 1,
                        "catalogue": "cata",
                        "isoStarttime": "2020-04-20T11:31:25.819Z",
                        "name": "namea",
                        "brutoSecs": 1,
                        "nettoSecs": 2,
                        "errors": 3,
                        "starttime": "starttime"
                    }],
                    "netto_total": 2,
                    "total_jobs": 1,
                    "with_errors": 1
                }
            },
            "We 20-05": {
                "namea": {
                    "bruto_total": 1,
                    "jobs": [{
                        "jobId": 2,
                        "catalogue": "cata",
                        "isoStarttime": "2020-05-20T11:31:25.819Z",
                        "name": "namea",
                        "brutoSecs": 1,
                        "nettoSecs": 2,
                        "errors": 3,
                        "starttime": "starttime"
                    }],
                    "netto_total": 2,
                    "total_jobs": 1,
                    "with_errors": 1
                }
            }
        }
    }

    expect(await getJobsSummary(jobs)).toEqual(expectResult)
})

it("should add durations", () => {
    // Setting the configuration variable to false is only used for local testing
    // against the acceptance API
    const tests = [
        ["0:00:00", "0:00:00", "0:00:00"],
        ["0:00:01", "0:00:02", "0:00:03"],
        ["0:00:09", "0:00:02", "0:00:11"],
        ["0:00:59", "0:00:02", "0:01:01"],
        ["0:01:00", "0:02:00", "0:03:00"],
        ["0:09:00", "0:02:00", "0:11:00"],
        ["0:59:00", "0:02:00", "1:01:00"],
        ["0:59:59", "0:02:02", "1:02:01"],
        ["3:03:03", "4:04:04", "7:07:07"],
        ["23:59:59", "10:00:02", "34:00:01"],
    ]
    tests.forEach(([d1, d2, sum]) => {
        let result = addDurations(d1, d2)
        expect(result).toEqual(sum)
        result = addDurations(d2, d1)
        expect(result).toEqual(sum)
    })
});

it("should add jobs to a process", () => {
    const job = {
        "ageCategory": "",
        "application": "any application",
        "attribute": "any attribute",
        "brutoDuration": "0:00:01",
        "catalogue": "any catalogue",
        "dataerrors": 1,
        "datainfos": 2,
        "datawarnings": 3,
        "day": "any day",
        "rawEndtime": "123",
        "endtime": "any formatted endtime",
        "entity": "any entity",
        "errors": 4,
        "infos": 5,
        "jobid": "any job id",
        "name": "any name",
        "nettoDuration": "0:00:02",
        "processId": "any process id",
        "source": "any source",
        "rawStarttime": "100",
        "starttime": "any formatted start time",
        "status": null,
        "user": "any user",
        "warnings": 6,
        "extra element": "any extra elements are ignored"
    }
    const processes = {}
    let result = jobProcess(job, processes)
    expect(result).toEqual({
        "ageCategory": "",
        "application": "any application",
        "attribute": "any attribute",
        "brutoDuration": "0:00:01",
        "catalogue": "any catalogue",
        "dataerrors": 1,
        "datainfos": 2,
        "datawarnings": 3,
        "day": "any day",
        "entity": "any entity",
        "errors": 4,
        "infos": 5,
        "jobid": "P_any job id",
        "name": "any name",
        "jobs": [job],
        "nettoDuration": "0:00:02",
        "processId": "any process id",
        "source": "any source",
        "starttime": "100",
        "endtime": "123",
        "rawStarttime": "100",
        "rawEndtime": "123",
        "status": null,
        "user": "any user",
        "warnings": 6
    })
    // Add next job
    result = jobProcess(job, processes)
    expect(result).toEqual({
        "ageCategory": "",
        "application": "any application",
        "attribute": "any attribute",
        "brutoDuration": "0:00:02",
        "catalogue": "any catalogue",
        "dataerrors": 2,
        "datainfos": 4,
        "datawarnings": 6,
        "day": "any day",
        "entity": "any entity",
        "errors": 8,
        "infos": 10,
        "jobid": "P_any job id",
        "name": "any name",
        "jobs": [job, job],
        "nettoDuration": "0:00:04",
        "processId": "any process id",
        "source": "any source",
        "starttime": "100",
        "endtime": "123",
        "rawStarttime": "100",
        "rawEndtime": "123",
        "status": null,
        "user": "any user",
        "warnings": 12
    })

    // Take "worst" status
    const states = [
        "rejected",
        "failed",
        "scheduled",
        "started",
        "ended"
    ].reverse()
    states.forEach(status => {
        job.status = status
        result = jobProcess(job, processes)
        expect(result.status).toEqual(status)
    })

    // Take "longest" age category
    const categories = [
        ' 0 - 24 uur',
        '24 - 48 uur',
        '48 - 96 uur',
        'Ouder'
    ]
    categories.forEach(cat => {
        job.ageCategory = cat
        result = jobProcess(job, processes)
        expect(result.ageCategory).toEqual(cat)
    })

    // Latest end time
    const endTimes = [
        ["456", "456"],
        ["123", "456"],
        ["457", "457"],
        [null, null],
        ["458", null],
        [null, null],
        ["123", null],
        ["500", null],
    ]
    // If one of the jobs is not finished, the process is not finished
    endTimes.forEach(([endtime, expectation]) => {
        job.rawEndtime = endtime
        result = jobProcess(job, processes)
        expect(result.rawEndtime).toEqual(expectation)
    })

    // Starttime of latest job that has been added
    const startTimes = [
        "456",
        "457",
        null,
        "123"
    ]
    startTimes.forEach(starttime => {
        job.rawStarttime = starttime
        result = jobProcess(job, processes)
        expect(result.rawStarttime).toEqual(starttime)
    })
})

it("should enrich job info", () => {
    MockDate.set(new Date(2011, 10, 5, 14, 55, 0).toISOString())
    const job = {
        day: "2011-10-05T14:48:00.000",
        starttime: "2011-10-05T14:48:00.000",
        endtime: "2011-10-05T14:50:00.000",
        name: "jobname",
        status: "any status",
        catalogue: "jobcatalogue",
        entity: "jobentity",
        attribute: "jobattribute",
        nettoDuration: "0:00:10",
        brutoDuration: "0:00:20"
    }
    const jobs = {}
    let result = enrichJob(job, jobs)
    let expectation = {
        day: job.day,
        ago: expect.anything(),
        brutoDuration: job.brutoDuration,
        brutoSecs: 20,
        date: expect.anything(),
        duration: "2 minutes",
        execution: "recentste",
        endtime: "Wednesday 05 Oct 2011 16:50:00",
        rawEndtime: "2011-10-05T14:50:00.000",
        isoEndtime: "2011-10-05T14:50:00.000Z",
        jobId: "jobname.jobcatalogue.jobentity.jobattribute",
        description: "jobname jobcatalogue jobentity (jobattribute)",
        nettoDuration: job.nettoDuration,
        nettoSecs: 10,
        rawStarttime: "2011-10-05T14:48:00.000",
        starttime: "Wednesday 05 Oct 2011 16:48:00",
        isoStarttime: "2011-10-05T14:48:00.000Z",
        status: job.status,
        name: "jobname",
        catalogue: "jobcatalogue",
        entity: "jobentity",
        attribute: "jobattribute"
        }
    expect(result).toEqual(expectation)

    // No endtime, add second job for same task (voorgaande)
    job.endtime = null
    result = enrichJob(job, jobs)
    expectation = {
        ...expectation,
        execution: "voorgaande",
        duration: null,
        endtime: null,
        isoEndtime: null,
        rawEndtime: null
    }
    expect(result).toEqual(expectation)

    // Zombie jobs
    job.status = "started"
    job.isoStarttime = moment(new Date()).subtract(13, 'hours').toISOString()
    result = enrichJob(job, jobs)
    expectation = {
        ...expectation,
        execution: "voorgaande",
        duration: null,
        endtime: null,
        isoEndtime: null,
        rawEndtime: null,
        status: "zombie"
    }
    expect(result).toEqual(expectation)

    jobs[expectation.jobId] = false
    job.status = "scheduled"
    job.isoStarttime = new Date().toISOString()
    result = enrichJob(job, jobs)
    expectation = {
        ...expectation,
        execution: "lopende",
        duration: null,
        endtime: null,
        isoEndtime: null,
        rawEndtime: null,
        status: "scheduled"
    }
    expect(result).toEqual(expectation)


})
