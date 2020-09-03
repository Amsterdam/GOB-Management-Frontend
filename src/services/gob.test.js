import MockDate from 'mockdate'
import {addDurations, jobProcess, enrichJob} from "./gob"

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
})
