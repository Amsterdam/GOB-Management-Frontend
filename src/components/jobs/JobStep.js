import React from 'react';
import JobInfo from "./JobInfo";
import JobLogs from "./JobLogs";

const JobStep = props => {
    const {step} = props;

    return (
        <div>
            <h2>{step.name}</h2>
            <JobInfo jobInfo={step} skip={["type", "user"]}/>
            <JobLogs logs={step.logs}/>
        </div>
    )
}

export default JobStep;
