import React from 'react';
import {Badge} from "react-bootstrap";
import Moment from "react-moment";
import JobStatus from "./JobStatus";

const JobHeader = props => {
    const {job} = props;

    const badges = () => {
        const levels = [
            'infos',
            'warnings',
            'errors',
            'datainfos',
            'datawarnings',
            'dataerrors'
        ]
        return levels
            .filter(level => job[level] > 0)
            .map(level => (
                    <Badge key={level} className={"ml-2 " + level} variant={"light"}>{level} {job[level]}</Badge>
                )
            )
    }

    const attribute = () => {
        if (job.attribute) {
            return <div>{job.attribute}</div>
        }
    }

    const timeInfo = () => {
        let duration = null;
        if (job.brutoDuration) {
            duration = <span>{job.brutoDuration} / {job.nettoDuration}</span>
        } else {
            duration = <span><Moment format={"mm:ss"}>{job.ago}</Moment>...</span>
        }
        return (
            <span>
                {job.starttime}&nbsp;
                ({duration})
            </span>
        )
    }

    return (
        <div className="w-100 text-center overflow-hidden">
            <div>
                <div className="float-right">
                    <div className="text-right"><JobStatus job={job}/></div>
                </div>
                <div title={props.job.entity}>
                    {props.job.name}&nbsp;
                    {props.job.application || props.job.source}&nbsp;
                    {props.job.catalogue}&nbsp;
                    {props.job.entity}
                    {attribute()}
                    {badges()}
                    <div>
                        {timeInfo()}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default JobHeader;
