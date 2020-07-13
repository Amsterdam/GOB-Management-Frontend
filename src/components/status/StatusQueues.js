import React from "react";
import "./status.css";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExclamationCircle, faTrashAlt} from '@fortawesome/free-solid-svg-icons'

import auth from "../../services/auth";

import {purgeQueue} from "./services/queues"

import waiting from "./assets/waiting.gif"
import processing from "./assets/processing.gif"


class StatusQueues extends React.Component {
    isAdmin() {
        return auth.isAdmin();
    }

    render() {
        const purgeQueueButton = queue => {
            if (this.isAdmin() && queue.messages_ready > 0) {
                return (
                    <b-btn
                        size="sm"
                        onClick={() => purgeQueue(queue)}
                    >
                        <FontAwesomeIcon icon={faTrashAlt} className="fa-xs"/>
                    </b-btn>
                )
            }
        }

        const waitingIndicator = (nMessages, img) => {
            const MAX_WAITING = 4;
            const indicator = [...Array(Math.min(nMessages, MAX_WAITING))].map((n, i) => (
                <img
                    key={i}
                    alt={"."}
                    src={img}
                    height="20px"
                />
            ))
            if (nMessages > MAX_WAITING) {
                indicator.push(<span key="waiting">...</span>)
            }
            return indicator
        }

        const unusedQueueIndicator = displayName => {
            if (!displayName) {
                return (
                    <FontAwesomeIcon
                        icon={faExclamationCircle}
                        title="unused queue"
                    />
                )
            }
        }

        return (
            <div>
                <h3>Processes</h3>
                <table align="center">
                    <tbody>
                    <tr className="font-weight-bold queueRow">
                        <td align="left" colSpan="2">Process</td>
                        <td align="right" colSpan="2">Waiting</td>
                        <td align="right" colSpan="2">Processing</td>
                    </tr>
                    <tr className="font-weight-bold queueRow">
                        <td colSpan="2" align="left"><span>&Sigma;</span></td>
                        <td colSpan="2" align="right">
                            {this.props.queues.reduce((a, b) => a + b.messages_ready, 0)}
                        </td>
                        <td colSpan="2" align="right">
                            {this.props.queues.reduce((a, b) => a + b.messages_unacknowledged, 0)}
                        </td>
                    </tr>
                    {this.props.queues.map(queue => (
                        <tr key={queue.name} className="queueRow">
                            <td align="left" title={queue.name}>
                                {unusedQueueIndicator(queue.tooltip)}&nbsp;
                                {queue.tooltip || queue.display}
                            </td>
                            <td>
                                {purgeQueueButton(queue)}
                            </td>
                            <td>
                                {waitingIndicator(queue.messages_ready, waiting)}
                            </td>
                            <td align="right">
                                {queue.messages_ready}
                            </td>
                            <td>
                                {waitingIndicator(queue.messages_unacknowledged, processing)}
                            </td>
                            <td align="right">
                                {queue.messages_unacknowledged}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        )
    }
}

export default StatusQueues
