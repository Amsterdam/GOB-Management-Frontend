import React from 'react';
import {Badge} from "react-bootstrap";
import JobStatus from "./JobStatus";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import moment from 'moment';
import {get_gob_api} from '../../services/api';

const JobHeader = props => {
    const {job} = props;

    const badges = () => {
        const levels = [
            'infos',
            'warnings',
            'errors',
            'datainfos',
            'dataerrors'
        ]

        const badges = levels
            .filter(level => job[level] > 0)
            .map(level => (
                    <Badge key={level} className={"mr-2 " + level} variant={"light"}>{level} {job[level]}</Badge>
                )
            );

        if (job['datawarnings'] > 0) {
            // Add datawarnings badge with link to QA CSV for given catalogue/collection
            const link = get_gob_api() + 'gob/dump/qa/' + job.catalogue + '_' + job.entity + '?format=csv';
            badges.push(<a href={link} target={'_blank'} rel={'noopener noreferrer'}><Badge key={'datawarnings'} className={'mr-2 datawarnings'} variant={'light'}>datwarnings {job['datawarnings']}</Badge></a>);
        }
        return badges;
    }

    const attribute = () => {
        if (job.attribute) {
            return <span className="small">&nbsp;({job.attribute})</span>
        }
    }

    const timeInfo = () => {
        let duration = null;
        if (job.brutoDuration) {
            duration = <span>{job.brutoDuration} / {job.nettoDuration}</span>
        } else {
            duration = <span>&plusmn;&nbsp;{moment.duration(job.ago).humanize()}...</span>
        }
        return (
            <span>
                {job.starttime}&nbsp;
                ({duration})
            </span>
        )
    }

    const jobDescription = () => {
        return `${job.name} ${job.catalogue || ''} ${job.entity || ''}`
    }

    return (
        <div className="w-100 overflow-hidden">
            <div>
                <Row>
                    <Col>
                        <div className="float-left text-left">
                            {jobDescription()}{attribute()}
                        </div>
                        <div className="float-right text-right">
                            <JobStatus job={job}/>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div>
                            <div className="float-left text-left">
                                {badges()}
                            </div>
                            <div className="float-right text-right">
                                {timeInfo()}
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default JobHeader;
