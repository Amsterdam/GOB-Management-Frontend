import React from "react";

import {connect} from "react-redux";
import {setJobs, setCurrentJob, setFilter, addSlice} from "./jobsSlice";

import './jobs.css'

import {getJobs, logsForJob} from "../../services/gob";
import {Row, Col, Button as JobButton} from "react-bootstrap";
import JobHeader from "./JobHeader";
import Button from "@datapunt/asc-ui/es/components/Button";
import JobLogs from "./JobLogs";
import JobFilters from "./JobsFilters";
import {getState} from "./services/jobs";
import JobsCalendar from "./JobsCalendar";
import running from './assets/running.gif'
import JobsFilterOverview from "./JobsFilterOverview";
import {Link} from "react-router-dom";
import {getSearch, saveToUrl} from "../../services/state2url";
import InfiniteScroll from 'react-infinite-scroller';
import JobsShortcuts from "./JobsShortcuts";

class JobsPage extends React.Component {
    state = {
        loading: false
    }

    componentDidMount = async () => {
        if (this.props.allJobs.length === 0) {
            await this.loadJobs()
        }

        await this.loadState();

        if (this.props.currentJob.jobid && this.props.currentJob.logs.length === 0) {
            this.loadLogs(this.props.currentJob.jobid)
        }
    }

    loadState = async () => {
        const filter = {}
        for (let [key, value] of getSearch(this.props.history).entries()) {
            if (key === 'jobid') {
                this.loadLogs(parseInt(value))
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

    setCurrentJob = async jobid => {
        const toggle = this.props.currentJob.jobid === jobid

        if (toggle) {
            this.clearLogs()
        } else {
            this.loadLogs(jobid)
        }
    }

    render() {
        const selectedJobs = this.props.filteredJobs;

        const loading = () => {
            if (this.state.loading) {
                return (
                    <img src={running} alt="loading" height="20px" className={"ml-2"}/>
                )
            }

        }

        const renderJobs = () => {
            if (this.props.filteredSlice.length > 0) {
                const items = this.props.filteredSlice.map(job => (
                    <div key={job.jobid} className="mb-2">
                        <JobButton variant="outline-secondary" className="w-100" onClick={() => this.setCurrentJob(job.jobid)}>
                            <div className="w-100 p-1">
                                <JobHeader job={job}/>
                            </div>
                        </JobButton>
                        {jobLogs(job)}
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
            if (selectedJobs.length === 0 && !this.state.loading) {
                return (
                    <div className="text-center">
                        <h3>Geen resultaten gevonden</h3>
                        <p>Pas eventueel de filters en/of de datum aan</p>
                    </div>
                )
            }
        }

        return (
            <div>
                <span className="float-right small">({selectedJobs.length})</span>
                <h1 className="text-center">
                    Jobs
                    {loading()}
                </h1>
                <Row className="mt-2">
                    <Col xs={6} md={4} lg={3}>
                        <Button className="justify-content-center w-100 mb-2" onClick={this.resetFilters}>Reset
                            filters</Button>
                        <Button className="justify-content-center w-100 mb-2" onClick={this.loadJobs}>Refresh</Button>
                        <JobsShortcuts/>
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
    setFilter,
    addSlice
}

export default connect(mapStateToProps, mapDispatchToProps)(JobsPage);
