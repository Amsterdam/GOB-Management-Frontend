import React from 'react';
import './jobs.css';
import * as moment from "moment";
import {TZ} from "../../services/config";


const JobInfo = props => {
    const {jobInfo, skip} = props;
    const format = "dddd DD MMM YYYY HH:mm:ss";

    const infos = {
        type: ["Type", <span>{jobInfo.type}</span>],
        user: ["Gestart door", <span>{jobInfo.user || "onbekend"}</span>],
        start: ["Start", <span>{moment.utc(jobInfo.start).tz(TZ).format(format)}</span>],
        eind: ["Eind", <span>{moment.utc(jobInfo.end).tz(TZ).format(format)}</span>],
        duur: ["Duur", <span>{jobInfo.duration}</span>],
        status: ["Status", <span>{jobInfo.status}</span>]
    }

    return (
        <div>
        <table className="text-left">
            <tbody>
            {Object.keys(infos)
                .filter(key => !(skip || []).includes(key))
                .map(key => {
                    const [title, info] = infos[key]
                    return (
                        <tr key={title}>
                            <td className="id">{title}</td>
                            <td>{info}</td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
        </div>
    )
}

export default JobInfo;
