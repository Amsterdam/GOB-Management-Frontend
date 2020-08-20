import React from "react";
import PropTypes from 'prop-types';
import {getJobs, getQueues} from "./services/queues";
import {getDbLocks} from "./services/database";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faLock, faInbox, faCog} from '@fortawesome/free-solid-svg-icons'
import './status.css'

class StatusIcons extends React.Component {
    state = {
        queues: [],
        locks: [],
        jobs: []
    }

    async componentDidMount() {
        await this.update();
        this.interval = setInterval(this.update.bind(this), 500);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    async update() {
        // Load status data in parallel
        const [queues, locks, jobs] = [getQueues(), getDbLocks(), getJobs()]
        this.setState({
            queues: await queues,
            locks: await locks,
            jobs: await jobs
        });
    }

    indicator(n, icon, className) {
        className = (className || '') + ' statusicon'
        icon = icon && <FontAwesomeIcon icon={icon} className={className} aria-hidden={"false"}/>
        return <span>{icon}{n.toLocaleString()}</span>
    }

    render() {
        const indicators = {
            waiting: { icon: faInbox, n: this.state.queues.reduce((a, b) => a + b.messages_ready, 0) },
            processing: { icon: faCog, className: "fa-spin", n: this.state.queues.reduce((a, b) => a + b.messages_unacknowledged, 0)},
            locks: { icon: faLock, n: this.state.locks.length},
            jobs: {  n: this.state.jobs }
        }

        const activeIndictors = Object.entries(indicators)
            .filter(([key, v]) => this.props.indicators.includes(key))
            .filter(([key, v]) => v.n > 0)

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

StatusIcons.propTypes = {
    indicators: PropTypes.arrayOf(PropTypes.string).isRequired  // Which indicators should be shown
}

export default StatusIcons;
