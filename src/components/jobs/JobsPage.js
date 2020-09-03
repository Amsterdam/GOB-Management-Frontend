import React from "react";

import {connect} from "react-redux";
import {setJobs, setCurrentJob, setCurrentProcess, setFilter, addSlice} from "./jobsSlice";

import './jobs.css'

import {getJobs, logsForJob} from "../../services/gob";
import {Row, Col, Button as JobButton, DropdownButton, Dropdown} from "react-bootstrap";
import JobHeader from "./JobHeader";
import Button from "@datapunt/asc-ui/es/components/Button";
import JobLogs from "./JobLogs";
import JobFilters from "./JobsFilters";
import {aggregationTitles, getState} from "./services/jobs";
import JobsCalendar from "./JobsCalendar";
import running from './assets/running.gif'
import JobsFilterOverview from "./JobsFilterOverview";
import {Link} from "react-router-dom";
import {getSearch, saveToUrl} from "../../services/state2url";
import InfiniteScroll from 'react-infinite-scroller';
import JobsShortcuts from "./JobsShortcuts";

class JobsPage extends React.Component {
    state = {
        loading: false,
        initializing: false
    }

    componentDidMount = async () => {
        this.setState({initializing: true})
        await this.loadState();

        if (this.props.allJobs.length === 0) {
            await this.loadJobs()
        }

        if (this.props.currentJob.jobid && this.props.currentJob.logs.length === 0) {
            this.loadLogs(this.props.currentJob.jobid)
        }

        this.setState({initializing: false})
    }

    loadState = async () => {
        const filter = {}
        for (let [key, value] of getSearch(this.props.history).entries()) {
            if (key === 'jobid') {
                this.loadLogs(parseInt(value))
            } else if (key === 'processid') {
                this.props.setCurrentProcess({processId: value})
            } else {
                filter[key] = value.split(",")
            }
        }
        if (Object.keys(filter).length > 0) {
            // Overwrite filter with only the new values
            this.props.setFilter({
                ...Object.keys(this.props.filter).reduce((obj, k) => ({...obj, [k]: []}), {}),
                ...filter
            })
        }
        const state = getState(this.props)
        saveToUrl(this.props.history, state)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const prev = getState(prevProps)
        const state = getState(this.props)
        if (JSON.stringify(state) !== JSON.stringify(prev)) {
            saveToUrl(this.props.history, state)
        }
    }

    loadJobs = async () => {
        this.setState({loading: true})
        const jobs = await getJobs({daysAgo: 7})
        this.props.setJobs(jobs)
        this.setState({loading: false})
    }

    loadLogs = async (jobid) => {
        this.setState({loading: true})
        const logs = await logsForJob(jobid)
        this.props.setCurrentJob({jobid, logs})
        this.setState({loading: false})
    }

    clearLogs = () => {
        this.props.setCurrentJob({jobid: null, logs: []})
    }

    resetFilters = () => {
        const filter = Object.keys(this.props.filter).reduce((obj, key) => ({...obj, [key]: []}), {})
        this.props.setFilter(filter)
    }

    setView = aggregateLevel => {
        this.props.setFilter({
            ...this.props.filter,
            aggregateLevel: [aggregateLevel]
        })
    }

    setCurrent = async job => {
        // Set current Job or Process
        return job.jobs ? this.setCurrentProcess(job.processId) : this.setCurrentJob(job.jobid)
    }

    setCurrentJob = async jobid => {
        const toggle = this.props.currentJob.jobid === jobid

        if (toggle) {
            this.clearLogs()
        } else {
            this.loadLogs(jobid)
        }
    }

    setCurrentProcess = async processId => {
        const toggle = this.props.currentProcessId === processId

        if (toggle) {
            this.clearLogs()    // Also clear any current job and open logs
            this.props.setCurrentProcess({processId: null})
        } else {
            this.props.setCurrentProcess({processId})
        }
    }

    render() {
        const selectedJobs = this.props.filteredJobs;
        const aggregateLevel = this.props.filter.aggregateLevel[0]
        const aggregateTitle = aggregationTitles[aggregateLevel]

        const loading = () => {
            if (this.state.loading || this.state.initializing) {
                return (
                    <img src={running} alt="loading" height="20px" className={"ml-2"}/>
                )
            }
        }

        const renderJob = job => {
            return <div>
                <JobButton variant="outline-secondary" className="w-100" onClick={() => this.setCurrent(job)}>
                    <div className="w-100 p-1">
                        <JobHeader job={job}/>
                    </div>
                </JobButton>
                {jobLogs(job)}
            </div>
        }

        const renderSubJobs = job => {
            if (this.props.currentProcessId === job.processId) {
                return (job.jobs || []).map(subjob =>
                    <div key={subjob.jobid} className="mt-2 mb-2 ml-5">
                        {renderJob(subjob)}
                    </div>)
            }
        }

        const renderJobs = () => {
            if (this.props.filteredSlice.length > 0) {
                const items = this.props.filteredSlice.map(job => (
                    <div key={job.jobid} className="mb-2">
                        {renderJob(job)}
                        {renderSubJobs(job)}
                    </div>
                ))
                return (
                    <InfiniteScroll
                        pageStart={0}
                        hasMore={this.props.filteredSlice.length < this.props.filteredJobs.length}
                        loadMore={this.props.addSlice}>
                        {items}
                    </InfiniteScroll>
                )
            }
        }

        const jobLogs = job => {
            if (job.jobid === this.props.currentJob.jobid) {
                return (
                    <div className="mt-2">
                        <Link className="float-right" to={"/jobs/" + job.jobid}>
                            <Button>Details</Button>
                        </Link>
                        <JobLogs job={job} logs={this.props.currentJob.logs}/>
                    </div>
                )
            }
        }

        const noData = () => {
            if (selectedJobs.length === 0 && !this.state.initializing) {
                return (
                    <div className="text-center">
                        <h3>Geen resultaten gevonden</h3>
                        <p>Pas eventueel de filters en/of de datum aan</p>
                    </div>
                )
            }
        }

        const viewHeader = () => {
            return <DropdownButton variant="outline-secondary" title={aggregateTitle} className="d-inline-block">
                {Object.entries(aggregationTitles).map(([level, title]) =>
                    <Dropdown.Item key={level} onClick={() => this.setView(level)}>{title}</Dropdown.Item>
                )}
            </DropdownButton>
        }

        return (
            <div>
                <span className="float-right small">({selectedJobs.length})</span>
                <h1 className="text-center">
                    {viewHeader()}
                    {loading()}
                </h1>
                <Row className="mt-2">
                    <Col xs={6} md={4} lg={3}>
                        <Button className="justify-content-center w-100 mb-2" onClick={this.resetFilters}>Reset
                            filters</Button>
                        <Button className="justify-content-center w-100 mb-2" onClick={this.loadJobs}>Refresh</Button>
                        <JobsShortcuts aggregateLevel={aggregateTitle}/>
                        <JobsCalendar jobs={this.props.allJobs}></JobsCalendar>
                        <JobFilters jobs={this.props.allJobs}></JobFilters>
                    </Col>
                    <Col xs={6} md={8} lg={9}>
                        <JobsFilterOverview></JobsFilterOverview>
                        {noData()}
                        {renderJobs()}
                        {/*<InfiniteLoader onVisited={() => handleVisit()}/>*/}
                    </Col>
                </Row>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {...state.jobs}
}

const mapDispatchToProps = {
    setJobs,
    setCurrentJob,
    setCurrentProcess,
    setFilter,
    addSlice
}

export default connect(mapStateToProps, mapDispatchToProps)(JobsPage);
