import React from 'react';
import {TZ} from "../../services/config";
import * as moment from 'moment'

const JobLogLines = props => {
    const {logs, filter} = props;

    const selectedLogs = logs
        .filter(l => !l.msgid)
        .filter(l => filter[l.level])

    if (selectedLogs.length === 0) {
        return null
    }

    const format = "HH:mm:ss"

    return (
        <table className={"text-left"}>
            <tbody>
            <tr>
                <th>Tijdstip</th>
                <th></th>
                <th>Bericht</th>
            </tr>
            {selectedLogs.map(log => (
                    <tr key={log.logid}>
                        <td>{moment.utc(log.timestamp).tz(TZ).format(format)}</td>
                        <td className={log.level}>{log.level}</td>
                        <td>
                            {log.msg}
                            {Object.entries(log.data || {}).map(([key, item]) => (
                                <div key={key} className="text-right">{key}: {item}</div>
                            ))}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>

    )
}

export default JobLogLines;
