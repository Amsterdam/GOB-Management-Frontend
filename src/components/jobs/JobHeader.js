import React from 'react';
import {Badge} from "react-bootstrap";
import JobStatus from "./JobStatus";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import moment from 'moment';
import {get_gob_api} from '../../services/api';
import {faDownload} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

import './jobs.css'

const JobHeader = props => {
    const {job} = props;

    const badge = (level, link) => {
        // default badge title is level and number of messages, example: infos 36
        let title = <span>
            {level} {job[level]}
        </span>
        let tooltip = null
        if (link && !job.jobs) {
            // for data messages a link is available to download the messages, wrap the title in a hyperlink
            title = <a className={"badgeLink"} href={link}>
                {title} <FontAwesomeIcon icon={faDownload} />
            </a>
            tooltip = `Download QA messages`
        }
        // A click on a badge does not propagate and stops any other action
        return <Badge key={level} title={tooltip} className={"mr-2 " + level} variant={"light"}
                      onClick={e => e.stopPropagation()}>
            {title}
        </Badge>
    }

    const badges = () => {
        const dataLink = `${get_gob_api()}gob/dump/qa/${job.catalogue}_${job.entity}?format=csv`;

        const levels = {
            infos: {},
            warnings: {},
            errors: {},
            datainfos: {link: dataLink},
            datawarnings: {link: dataLink},
            dataerrors: {link: dataLink}
        }

        return Object.entries(levels)
            .filter(([level, data]) => job[level] > 0)
            .map(([level, data]) => badge(level, data.link));
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
        let description = `${job.name} ${job.catalogue || ''} ${job.entity || ''}`
        if (job.jobs) {
            description += ` (${job.jobs.length} job${job.jobs.length > 1 ? 's' : ''})`
        }
        return description
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
