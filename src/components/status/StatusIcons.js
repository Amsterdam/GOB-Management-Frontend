import React from "react";
import {getQueues} from "./services/queues";
import {getDbLocks} from "../../services/gob_api";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faLock, faInbox, faCog} from '@fortawesome/free-solid-svg-icons'
import './status.css'

class StatusIcons extends React.Component {
    state = {
        queues: [],
        locks: [],
        queries: []
    }

    async componentDidMount() {
        await this.update();
        this.interval = setInterval(this.update.bind(this), 2500);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    async update() {
        // Load status data in parallel
        const [queues, locks] = [getQueues(), getDbLocks()]
        this.setState({
            queues: await queues,
            locks: await locks});
    }

    indicator(n, icon, className) {
        className = (className || '') + ' statusicon'
        return <span>
            <FontAwesomeIcon icon={icon} className={className} aria-hidden={"false"}/>{n}
        </span>
    }

    render() {
        const indicators = {
            waiting: { icon: faInbox, n: this.state.queues.reduce((a, b) => a + b.messages_ready, 0) },
            processing: { icon: faCog, className: "fa-spin", n: this.state.queues.reduce((a, b) => a + b.messages_unacknowledged, 0)},
            locks: { icon: faLock, n: this.state.locks.length}
        }

        const activeIndictors = Object.entries(indicators).filter(([key, v]) => v.n > 0)

        if (activeIndictors.length === 0) {
            return null;
        }

        return (
            <span className={this.props.className}>
                {activeIndictors
                    .map(([key, v], i) =>
                        <span key={key} className={i > 0 ? "ml-1" : ""}>{this.indicator(v.n, v.icon, v.className)}</span>)}
            </span>
        )
    }
}

export default StatusIcons;
