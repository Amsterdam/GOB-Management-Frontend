import {getJobs} from "../../../services/gob";

export const MESSAGE_TYPES = "messageTypes"

export const filterTypes = [
    {text: "Status", key: "status"},
    {text: "Verwerking", key: "execution"},
    {text: "Leeftijd", key: "ageCategory"},
    {text: "Type verwerking", key: "name"},
    {text: "Registraties", key: "catalogue"},
    {text: "Entiteiten", key: "entity"},
    {text: "Attributen", key: "attribute"}
]

export const messageTypes = [
    {text: "Info", key: "infos"},
    {text: "Warning", key: "warnings"},
    {text: "Error", key: "errors"},
    {text: "Data Info", key: "datainfos"},
    {text: "Data Warning", key: "datawarnings"},
    {text: "Data Error", key: "dataerrors"}
]


export function filterName(filterValue) {
    return filterValue.toLowerCase().replace(/_/g, " ")
}

export function getState(props) {
    const filters = props => Object.keys(props.filter)
        .filter(key => props.filter[key].length > 0)
        .reduce((obj, key) => ({...obj, [key]: props.filter[key]}), {})

    return {
        jobid: props.currentJob.jobid,
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
            if (values.length === 0) {
                match = true
            } else {
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
            }
            return match && result
        }, true)
    })
}

export async function loadJobs(filter={daysAgo: 7}) {
    const jobs = await getJobs(filter)
    return jobs
}
