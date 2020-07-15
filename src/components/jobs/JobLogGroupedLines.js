import React from 'react';
import * as _ from "lodash";
import {Accordion} from "@datapunt/asc-ui";

const JobLogGroupedLines = props => {
    const {logs, filter} = props;

    const msgids = _.uniqBy(
        logs.filter(l => l.msgid).filter(l => filter[l.level]),
        "msgid"
    );

    return (
        <div>
            {msgids.map(id => {
                const idlogs = logs.filter(l => l.msgid === id.msgid)
                const title = `${id.level} (${idlogs.length})`
                return (
                    <div key={id.msgid} className="mb-2 text-left">
                        <div>{title}</div>
                        <Accordion
                            id={id.msgid}
                            title={id.msgid}>
                            {idlogs.map(log => (
                                <div key={log.logid}>
                                    {Object.entries(log.data).map(([key, item]) => (
                                        <div key={key} className="text-right">{key} : {item} </div>
                                    ))}
                                </div>
                            ))}
                        </Accordion>
                    </div>
                )
            })}
        </div>
    )
}

export default JobLogGroupedLines;
