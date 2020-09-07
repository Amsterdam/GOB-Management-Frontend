import {AGGREGATE_ON_JOB, AGGREGATE_ON_PROCESS, getJobs} from "../../../services/gob";

export const MESSAGE_TYPES = "messageTypes"

export const filterTypes = [
    {text: "Verwerking", key: "execution", defaultOpen: true},
    {text: "Type melding", key: MESSAGE_TYPES, defaultOpen: true},
    {text: "Type verwerking", key: "name", defaultOpen: true},
    {text: "Registraties", key: "catalogue", defaultOpen: true},
    {text: "Entiteiten", key: "entity", defaultOpen: false},
    {text: "Attributen", key: "attribute", defaultOpen: false},
    {text: "Status", key: "status", defaultOpen: false},
    {text: "Leeftijd", key: "ageCategory", defaultOpen: false},
    {text: "Bron", key: "source", defaultOpen: false},
    {text: "Applicatie", key: "application", defaultOpen: false},
    {text: "View", key: "aggregateLevel", defaultOpen: false, hidden: true}
]

export const aggregationTitles = {
    [AGGREGATE_ON_JOB]: "Jobs",
    [AGGREGATE_ON_PROCESS]: "Processen"
}

export function filterName(filterValue) {
    return filterValue.toLowerCase().replace(/_/g, " ")
}

export function getState(props) {
    const filters = props => Object.keys(props.filter)
        .filter(key => props.filter[key].length > 0)
        .reduce((obj, key) => ({...obj, [key]: props.filter[key]}), {})

    return {
        jobid: props.currentJob.jobid,
        processid: props.currentProcessId,
        ...filters(props)
    }
}

export function filterJobs(jobs, filter) {
    const jobsFilter = Object.entries(filter).reduce((result, [key, values]) => {
        if (values.length > 0) {
            result[key] = values
        }
        return result;
    }, {})
    return jobs.filter(job => {
        return Object.entries(jobsFilter).reduce((result, [key, values]) => {
            let match = false;
            const specialKeys = [MESSAGE_TYPES, "year", "month", "day"]
            if (specialKeys.includes(key)) {
                if (key === MESSAGE_TYPES) {
                    match = values.reduce((s, t) => s + job[t], 0) > 0
                } else {
                    const jobDate = new Date(job.isoStarttime)
                    const dtElements = {
                        year: jobDate.getFullYear(),
                        month: jobDate.getMonth() + 1,
                        day: jobDate.getDate()
                    }
                    match = values.includes(dtElements[key])
                }
            } else {
                match = job[key] && values.includes(filterName(job[key]))
            }
            return match && result
        }, true)
    })
}

export async function loadJobs(filter={daysAgo: 7}) {
    const jobs = await getJobs(filter)
    return jobs
}
