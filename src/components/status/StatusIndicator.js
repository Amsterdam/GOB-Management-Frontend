import React from "react";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import ProgressBar from "react-bootstrap/ProgressBar";

import {isServiceRunning} from "./services/services";
import {isAlive, ALIVE_INTERVAL} from "../../services/status";

class StatusIndicator extends React.Component {

    progress(service) {
        if (service) {
            return isAlive(service)
                ? ALIVE_INTERVAL - service.age // descending
                : service.age - ALIVE_INTERVAL; // ascending
        } else {
            return 0;
        }
    }

    render() {
        const runningInstances = service => {
            if (service && service.instances) {
                const running = service.instances.filter(i => isServiceRunning(i)).length;
                const alive = service.instances.filter(i => i.isAlive).length;
                return (
                    <span>
                        <span className={running > 0 ? 'ERROR_TEXT' : 'INFO_TEXT'}>
                            {running}
                        </span> / {alive}
                    </span>
                )
            } else {
                return <span>&nbsp;</span>
            }
        }

        const icon = () => (
            <FontAwesomeIcon
                icon={this.props.icon}
                className={this.props.reversedIcon ? 'fa-rotate-180' : ''}
            />
        )

        const name = () => (
            <div>
                <div>{this.props.name}</div>
                {runningInstances(this.props.service)}
            </div>
        )

        const progress = () => (
            <ProgressBar now={this.progress(this.props.service)}
                         className={this.props.reversed ? 'mt-3' : 'mb-3'}
                         variant={isAlive(this.props.service) ? "success" : "danger"}
            />
        )

        let items = [icon(), name(), progress()]
        if (this.props.reversed) {
            items = items.reverse()
        }

        return (
            <div className="statusIndicator">
                {items.map((item, i) => (
                    <div key={i}>{item}</div>
                ))}
            </div>
        )
    }
}

export default StatusIndicator;