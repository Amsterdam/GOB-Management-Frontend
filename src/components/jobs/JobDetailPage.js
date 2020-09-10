import React from "react";

import {getJob, getJobs, deleteJob, logsForJobStep} from "../../services/gob";
import auth from "../../services/auth";
import JobHeader from "./JobHeader";
import JobInfo from "./JobInfo";
import JobRestart from "./JobRestart";
import JobStep from "./JobStep";
import Button from "@datapunt/asc-ui/lib/components/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrashAlt} from "@fortawesome/free-solid-svg-icons";

class JobDetailPage extends React.Component {
    state = {
        jobId: null,
        job: null,
        jobInfo: {
            steps: []
        },
        loading: true
    }

    componentDidMount = async () => {
        const jobId = this.props.match.params.id;

        this.setState({loading: true, jobId})

        const jobInfo = await getJob(jobId);
        for (var step of jobInfo ? jobInfo.steps : []) {
            step.logs = await logsForJobStep(jobId, step.stepid);
        }

        var jobs = await getJobs({jobid: jobId});
        const job = jobs[1];    // 0 is process

        this.setState({job, jobInfo, loading: false})
    }

    async deleteJob(job) {
        const result = await deleteJob(job);
        if (result) {
            this.props.history.push("/jobs");
        }
    }

    render() {
        const {jobId, job, jobInfo, loading} = this.state

        const restartJob = () => {
            if (auth.isAdmin()) {
                return (
                    <div className={"mb-2 mt-2"}>
                        <JobRestart catalog={job.catalogue} collection={job.entity} action={jobInfo.type}/>
                    </div>
                )
            }
        }

        const deleteJob = () => {
            if (auth.isAdmin()) {
                return (
                    <div align="right">
                        <Button onClick={() => this.deleteJob(job)}>
                            <FontAwesomeIcon icon={faTrashAlt}/>&nbsp;
                            Delete job {job.jobid}
                        </Button>
                    </div>
                )
            }
        }

        const details = () => (
            <div>
                <JobHeader job={job}/>
                <JobInfo jobInfo={jobInfo}/>
                {restartJob()}
                {jobInfo.steps.map(step => (
                    <div key={step.stepid} className="mb-2">
                        <JobStep step={step}/>
                    </div>
                ))}
                {deleteJob()}
            </div>
        )

        let body;
        if (job) {
            body = details();
        } else if (loading) {
            body = <div>Loading job {jobId}...</div>
        } else {
            body = <div>Job {jobId} not found</div>
        }

        return (
            <div className={"text-center mb-5"}>
                <h1>Job Details</h1>
                {body}
            </div>
        )
    }

}

export default JobDetailPage;
