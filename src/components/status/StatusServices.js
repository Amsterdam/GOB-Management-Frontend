import React from "react";

import {Row, Col} from "react-bootstrap"
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCog} from '@fortawesome/free-solid-svg-icons'

import {isServiceRunning, getTasks, getTaskName} from "./services/services";


class StatusServices extends React.Component {
    render() {
        const runningIndicator = instance => {
            if (isServiceRunning(instance)) {
                return (
                    <FontAwesomeIcon icon={faCog} className={"fa-spin"}/>
                )
            }
        }

        const countIndicator = (service, i) => {
            if (service.instances.length > 1) {
                return <span>({i + 1})</span>
            }
        }

        return (
            <div>
                <h4>Services</h4>
                <div>
                    <Row className="justify-content-center">
                        {Object.entries(this.props.services).map(([serviceName, service]) => (
                            <div key={"service" + service.serviceId}>
                                {(service.instances || []).filter(i => i.tasks.length > 0).map((instance, i) => (
                                    <div key={"instance" + instance.serviceId}>
                                        <Col className="mb-2">
                                            <div className="pl-1 pr-1 border">
                                                <div>
                                                    {instance.name}
                                                    {countIndicator(service, i)}
                                                    {runningIndicator(instance)}
                                                </div>
                                                {getTasks(instance).map(task => (
                                                    <div key={task.name} className="small">
                                                        {getTaskName(task)}
                                                    </div>
                                                ))}
                                            </div>
                                        </Col>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </Row>
                </div>
            </div>
        )
    }
}

export default StatusServices;