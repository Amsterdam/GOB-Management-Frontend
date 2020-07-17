import React, {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    faPlay
} from '@fortawesome/free-solid-svg-icons'
import Button from "@datapunt/asc-ui/lib/components/Button";
import {startJob} from "../management/services/jobs";

const JobRestart = props => {
    const {catalog, collection, action} = props;

    const [restarted, setRestarted] = useState(false);
    const [result, setResult] = useState("");

    const supportedActions = ["import", "relate", "export", "export_test", "dump"]

    const restart = async event => {
        event.preventDefault()
        setRestarted(true)
        const result = await startJob(action, catalog, collection)
        setResult(result.text)
    }

    if (supportedActions.includes(action)) {
        return (
            <div>
                <Button onClick={restart} disabled={restarted}>
                    <FontAwesomeIcon icon={faPlay} />&nbsp;
                    Herstart {action} {catalog} {collection}
                </Button>
                <div>
                    {result}
                </div>
            </div>
        )
    } else {
        return null;
    }
}

export default JobRestart;
