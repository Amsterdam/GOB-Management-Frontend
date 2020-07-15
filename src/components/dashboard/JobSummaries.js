import React from 'react'
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";

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
                showRowLabels: true
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
        if (recentJobs.length === 0) {
            return
        }
        let catalogs = this.props.catalogs;

        const timeData = {}
        const stats = {}
        const jobData = {}

        catalogs.forEach(catalog => {
            timeData[catalog] = [
                [
                    {type: "string", id: "Verwerking"},
                    {type: "string", id: "row label"},
                    {type: 'string', role: 'tooltip', p: {'html': true}},
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

                const rowLabel = `${moment(starttime)
                    .tz(TZ)
                    .format("DD-MM HH:mm")} - ${moment(endtime)
                    .tz(TZ)
                    .format("DD-MM HH:mm")}`;

                const tooltip = this.htmlTooltip(pr, starttime, endtime, catalogJobs)

                if (starttime && endtime) {
                    timeData[catalog].push([pr, rowLabel, tooltip, starttime, endtime]);
                } else {
                    timeData[catalog].push([pr, `geen ${pr} jobs`, "", new Date(), new Date()]);
                }
            });
        });
        this.setState({timeData, jobData})
    }

    htmlTooltip = (pr, starttime, endtime, jobs) => {
        /**
         * Provide for a HTML tooltip to show jobs within a time interval
         *
         * Use humanized durations to make duration simple to interpret
         */
        const asDuration = (start, end) => moment.duration(moment(end).diff(moment(start))).humanize()

        const duration = asDuration(starttime, endtime)
        const jobRows = jobs.map(job => {
            const [start, end] = [job.isoStarttime, job.isoEndtime]
                .map(t => moment(t).tz(TZ).format("DD-MM HH:mm"))
            // Print the job that started the interval and the job that ended the interval bold
            const [isStart, isEnd] = [[starttime, job.isoStarttime], [endtime, job.isoEndtime]]
                .map(([t, jt]) => jt ? t.getTime() === new Date(jt).getTime() : false)
                .map(b => b ? 'class="font-weight-bold"': '')
            const duration =asDuration(job.isoStarttime, job.isoEndtime)
            return `<tr>
                        <td>${job.description}</td>
                        <td ${isStart}>${start}</td>
                        <td ${isEnd}>${end}</td>
                        <td>${duration}</td>
                    </tr>`
        })
        const tableHeader = `<tr>
                                <th>Naam</th>
                                <th>Start</th>
                                <th>Eind</th>
                                <th>Duur</th>
                            </tr>`
        const table = `<table class="text-left">
                            ${tableHeader}
                            ${jobRows.join('')}
                       </table>`
        const tooltip = `<div class="m-2">
                            <h4 class="text-uppercase">${pr}</h4>
                            <hr>
                            <h5>Duur: ${duration}, jobs: ${jobs.length}</h5>
                            ${table}
                         </div>`
        return tooltip
    }

    onSelect = selection => {
        /**
         * On select a time series redirect to the jobs that make up the time series
         */
        if (selection?.length > 0) {
            const rowNum = selection[0].row
            const row = this.state.timeData[this.props.catalog][rowNum + 1] // Skip header row
            let query = {
                catalogue: this.props.catalog,
                execution: "recentste",
                name: row[0].replace("_", " ")
            };
            const redirect = "/jobs/?" + new URLSearchParams(query)
            this.props.history.push(redirect)
        }
    }

    chartEvents = [
        {
            eventName: "select",
            callback: ({ chartWrapper }) => {
                this.onSelect(chartWrapper.getChart().getSelection())
            }
        }
    ]

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
                           loader={<div>Loading Chart</div>}
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
                           chartEvents={this.chartEvents}
                           data={data}
                           options={options}/>
                )
            } else {
                return (<div>Geen data gevonden</div>)
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(JobSummaries));