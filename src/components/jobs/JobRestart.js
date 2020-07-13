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

    const restart = async () => {
        setRestarted(true)
        await startJob(action, catalog, collection)
    }

    return (
        <div>
            <Button onClick={restart} disabled={restarted}>
                <FontAwesomeIcon icon={faPlay} />&nbsp;
                Herstart {action} {catalog} {collection}
            </Button>
        </div>
    )
}

export default JobRestart;
