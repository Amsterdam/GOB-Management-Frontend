import React from 'react';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    faClock, faFlagCheckered, faWrench, faCarCrash
} from '@fortawesome/free-solid-svg-icons'
import rejected from "./assets/rejected.gif"
import running from "./assets/running.gif"
import zombie from "./assets/zombie.gif"

const JobStatus = props => {
    const {job} = props;

    const height = "20px"
    const fragments = {
        scheduled: (
            <span title="Job (of onderdeel daarvan) wacht om uitgevoerd te worden">
                <FontAwesomeIcon icon={faClock}/>
            </span>),
        zombie: (
            <span title="Job duurt langer dan 12 uur">
                {job.step}
                <img src={zombie} alt={"zombie"} height={height}/>
            </span>),
        started: (
            <span title="Job wordt uitgevoerd">
                {job.step}
                <img src={running} alt={"running"} height={height} />
            </span>),
        rejected: (
            <span title="Job is geweigerd">
                {job.status}
                <img src={rejected} alt={"rejected"} height={height} />
            </span>),
        failed: (
            <span title="Job is gecrashed">
                <FontAwesomeIcon icon={faCarCrash}/>
            </span>)
    }

    let fragment;
    if (job.status === "ended") {
        if (job.endtime || job.end) {
            fragment = (
                <span title="Job is geëindigd">
                    <FontAwesomeIcon icon={faFlagCheckered}/>
                </span>)
        } else {
            fragment = (
                <span title="Job loopt nog terwijl er geen taken gepland staan om de job af te ronden">
                    <FontAwesomeIcon icon={faWrench}/>
                </span>
            )
        }
    } else {
        fragment = fragments[job.status]
    }

    return (
        <span>
            {fragment}
        </span>
    )
}

export default JobStatus;
