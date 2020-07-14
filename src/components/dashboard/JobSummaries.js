import React from 'react'
import {connect} from "react-redux";

import './dashboard.css';

import * as moment from 'moment'

import Chart from "react-google-charts";
import {setJobs} from "../jobs/jobsSlice";
import {defaultOrdering} from "./services/dashboard";
import {Col, Row} from "react-bootstrap";
import {TZ} from "../../services/config";
import {loadJobs} from "../jobs/services/jobs";

class JobSummaries extends React.Component {
    EXCLUDE = ["data consistency test"]
    PROCESSES = defaultOrdering.filter(o => !this.EXCLUDE.includes(o))

    state = {
        timeData: null,
        jobData: null,
        chartOptions: {
            pieChart: {
                legend: "none",
                titleTextStyle: {
                    fontSize: 12
                },
                slices: {
                    0: {color: "green"},
                    1: {color: "orange", offset: 0.1},
                    2: {color: "red", offset: 0.2}
                }
            },
            timeline: {
                legend: "none",
                showRowLabels: false
            },
            hAxis: {
                format: "HH:mm"
            }
        }
    }

    componentDidMount = async () => {
        if (this.props.allJobs.length === 0) {
            const jobs = await loadJobs()
            this.props.setJobs(jobs)
        }
        this.loadCharts()
    }

    firstProcess(jobs, catalog, process) {
        const EOT = new Date("2099-12-31");
        const first = jobs.reduce(
            (first, job) =>
                job.catalogue === catalog &&
                job.name.toLowerCase() === process &&
                new Date(job.isoStarttime) < first
                    ? new Date(job.isoStarttime)
                    : first,
            EOT
        );
        return first === EOT ? null : first;
    }

    lastProcess(jobs, catalog, process) {
        const BOT = new Date("2000-01-01");
        const last = jobs.reduce(
            (last, job) =>
                job.catalogue === catalog &&
                job.name.toLowerCase() === process &&
                new Date(job.isoEndtime) > last
                    ? new Date(job.isoEndtime)
                    : last,
            BOT
        );
        return last === BOT ? null : last;
    }

    loadCharts = async () => {
        let recentJobs = this.props.allJobs.filter(job => job.execution === "recentste");
        let catalogs = this.props.catalogs;

        const timeData = {}
        const stats = {}
        const jobData = {}

        catalogs.forEach(catalog => {
            timeData[catalog] = [
                [
                    {type: "string", id: "Verwerking"},
                    {type: "string", id: "row label"},
                    {type: "date", id: "Start"},
                    {type: "date", id: "Eind"}
                ]
            ];
            stats[catalog] = {};
            jobData[catalog] = {};

            this.PROCESSES.forEach(pr => {
                // Get begin and end the process
                const starttime = this.firstProcess(recentJobs, catalog, pr);
                const endtime = this.lastProcess(recentJobs, catalog, pr);

                // Get all jobs for the process
                const catalogJobs = recentJobs.filter(
                    job => job.catalogue === catalog && job.name.toLowerCase() === pr
                );

                const warningJobs = catalogJobs.filter(job => job.warnings > 0);
                const errorJobs = catalogJobs.filter(job => job.errors > 0);
                const infoOnlyJobs = catalogJobs.filter(
                    job => job.errors <= 0 && job.warnings <= 0
                );
                jobData[catalog][pr] = [
                    ["Job klasse", "Aantal"],
                    ["Jobs zonder meldingen", infoOnlyJobs.length],
                    ["Jobs met waarschuwingen", warningJobs.length],
                    ["Jobs met fouten", errorJobs.length]
                ];

                let infos = catalogJobs.reduce((infos, job) => infos + job.infos, 0);
                let errors = catalogJobs.reduce(
                    (errors, job) => errors + job.errors,
                    0
                );
                let warnings = catalogJobs.reduce(
                    (warnings, job) => warnings + job.warnings,
                    0
                );
                stats[catalog][pr] = {
                    infos,
                    errors,
                    warnings
                };

                const rowLabel = `${pr} ${moment(starttime)
                    .tz(TZ)
                    .format("DD-MM HH:mm")} - ${moment(endtime)
                    .tz(TZ)
                    .format("DD-MM HH:mm")}`;

                if (starttime && endtime) {
                    timeData[catalog].push([pr, rowLabel, starttime, endtime]);
                }
            });
        });
        this.setState({timeData, jobData})
    }

    render() {
        const pieCharts = (process) => {
            if (this.state.jobData && this.props.catalog && this.state.jobData[this.props.catalog][process]) {
                const data = this.state.jobData[this.props.catalog][process]
                const options = {
                    ...this.state.chartOptions.pieChart,
                    title: process
                }
                return (
                    <Chart chartType="PieChart"
                           data={data}
                           options={options}/>
                )
            }
        }

        const timeChart = () => {
            if (this.state.timeData && this.props.catalog) {
                const data = this.state.timeData[this.props.catalog]
                const options = this.state.chartOptions
                return (
                    <Chart chartType="Timeline"
                           className="timeline"
                           loader={<div>Loading Chart</div>}
                           data={data}
                           options={options}/>
                )
            }
        }

        return (
            <div>
                <Row>
                    {this.PROCESSES.map(process => (
                        <Col key={process}>
                            <div>
                                {pieCharts(process)}
                            </div>
                        </Col>
                    ))}
                </Row>
                <div>
                    {timeChart()}
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        ...state.dashboard,
        allJobs: state.jobs.allJobs
    }
}

const mapDispatchToProps = {
    setJobs
}

export default connect(mapStateToProps, mapDispatchToProps)(JobSummaries);