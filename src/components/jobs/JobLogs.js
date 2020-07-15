import React, {useState} from 'react';
import JobLogLines from "./JobLogLines";
import JobLogGroupedLines from "./JobLogGroupedLines";
import JobLogFilter from "./JobLogFilter";

const JobLogs = props => {
    const {job, logs} = props;

    const levels = logs.reduce((r, l) => {
        r[l.level] = r[l.level] || 0;
        r[l.level] += 1;
        return r;
    }, {});

    const initialFilter = Object.keys(levels)
        .reduce((obj, level) => (
            {
                ...obj,
                [level]: true
            }
        ), {})

    const [filter, setFilter] = useState(initialFilter)

    const onFilterLevel = event => {
        const {name, checked} = event.target
        setFilter({
            ...filter,
            [name]: checked
        })
    }

    const jobInfo = () => {
        if (job) {
            return (
                <div>
                    Job: {job.jobid}, gestart door: {job.user || "onbekend"}
                </div>
            )
        }
    }

    return (
        <div>
            {jobInfo()}
            <JobLogFilter levels={levels} filter={filter} onChange={onFilterLevel}></JobLogFilter>
            <JobLogLines logs={logs} filter={filter}/>
            <JobLogGroupedLines logs={logs} filter={filter}/>
        </div>
    )
}

export default JobLogs;
