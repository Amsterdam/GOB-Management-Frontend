import React from 'react'
import {connect} from "react-redux";

import {getJobsSummary} from "../../services/gob";
import Chart from "react-google-charts";
import {setBrutoNetto, setJobsSummary} from "./dashboardSlice";
import {defaultOrdering} from "./services/dashboard";
import {withRouter} from "react-router-dom";

function getConvertOptionsFunc(chartType) {
    return window.google && window.google.charts && window.google.charts[chartType]
        ? window.google.charts[chartType].convertOptions
        : null;
}

class LastWeek extends React.Component {
    WITH_ERRORS = " with errors"

    state = {
        chartData: null,
        chartOptions: null,
        convertFunc: null
    }

    componentDidMount = async () => {
        if (!this.props.jobsSummary) {
            const summary = await getJobsSummary();
            this.props.setJobsSummary(summary)
        }
        await this.loadData()
    }

    loadData = async () => {
        const summary = this.props.jobsSummary;

        const chartData = {};
        const chartOptions = {};

        // Transform to format understood by GChart library
        for (const [catalog, summaryData] of Object.entries(summary)) {
            const catalogData = [];

            // Create first row (['', prepare, prepare_errors, import, import_errors ...])
            const firstKey = Object.keys(summaryData)[0];
            const jobTypes = Object.keys(summaryData[firstKey])
                .sort((t1, t2) => defaultOrdering.indexOf(t1) - defaultOrdering.indexOf(t2));

            const firstRow = new Array(jobTypes.length);
            firstRow[0] = "";

            for (const jobType of jobTypes) {
                const processIdx = jobTypes.indexOf(jobType);
                if (processIdx === -1) continue;

                firstRow[processIdx * 2 + 1] = jobType;
                firstRow[processIdx * 2 + 2] = jobType + this.WITH_ERRORS;
            }
            catalogData.push(firstRow);

            // Fill data ([date, prepare_job_success_cnt, prepare_job_error_cnt, import_job_cnt, import_job_error_cnt, ... ])
            for (const [date, jobs] of Object.entries(summaryData)) {
                const row = new Array(firstRow.length);
                row[0] = date;
                for (const [job, result] of Object.entries(jobs)) {
                    const idx = firstRow.indexOf(job);
                    if (idx === -1) continue;

                    row[idx] = result.total_jobs - result.with_errors;
                    row[idx + 1] = result.with_errors;
                }
                catalogData.push(row);
            }

            chartData[catalog] = catalogData;
            chartOptions[catalog]= this.getChartOptions(catalogData)
        }

        this.setState({chartData, chartOptions})
    }

    chartEvents = [
        {
            eventName: "select",
            callback: ({ chartWrapper }) => {
                this.onSelect(chartWrapper.getChart().getSelection())
            }
        },
        {
            eventName: "ready",
            callback: ({ chartWrapper }) => {
                if (!this.state.convertFunc) {
                    const convertFunc = getConvertOptionsFunc("Bar");
                    this.setState({convertFunc});
                }
            }
        }
    ]

    onSelect = (selection) => {
        // On selection (click) of bar, redirect to Jobs overview
        if (selection.length) {
            let date = this.state.chartData[this.props.catalog][
            selection[0].row + 1
                ][0];
            let job = this.state.chartData[this.props.catalog][0][
                selection[0].column
                ].replace("_", " "); // Jobs overview expects spaces instead of underscores
            let [day, month] = date.split("-");

            let query = {
                catalogue: this.props.catalog,
                year: new Date().getFullYear(),
                day: day,
                month: month
            };

            if (job.indexOf(this.WITH_ERRORS) > -1) {
                // Clicked on an errors bar. Filter on errors in Jobs overview
                query.name = job.replace(this.WITH_ERRORS, "");
                query.messageTypes = "errors";
            } else {
                query.name = job;
            }

            const redirect = "/jobs/?" + new URLSearchParams(query)
            this.props.history.push(redirect)
        }
    }

    getChartOptions = catalogData => {
        // Get maximum value, ignore first row and first column of each row.
        const max = Math.max(
            ...catalogData.slice(1).map(l => Math.max(...l.slice(1)))
        );

        const viewWindow = {
            max: max,
            min: 0
        };
        const defaultVAxis = {
            viewWindow: viewWindow,
            gridlines: {
                color: "transparent"
            },
            textStyle: {
                color: "transparent"
            }
        };

        // Have group name plus 2 entries per axis
        const axisCnt = (catalogData[0].length - 1) / 2;

        const series = {};
        const vAxes = {
            0: {
                viewWindow: viewWindow
            }
        };

        for (let i = 0; i < axisCnt; i++) {
            vAxes[i * 2 + 1] = defaultVAxis;
            vAxes[i * 2 + 2] = defaultVAxis;

            series[i * 2] = {
                color: "green",
                targetAxisIndex: i
            };
            series[i * 2 + 1] = {
                color: "red",
                targetAxisIndex: i,
                visibleInLegend: false
            };
        }

        return {
            isStacked: true,
            colors: ["green"],
            legend: {
                position: "none"
            },
            vAxes: vAxes,
            series: series
        };
    }

    render() {
        const {convertFunc} = this.state;

        const chart = () => {
            if (this.state.chartData && this.props.catalog) {
                const data = this.state.chartData[this.props.catalog]
                let options = this.state.chartOptions[this.props.catalog]
                if (convertFunc) {
                    options = convertFunc(options)
                }
                return (
                    <Chart
                        chartType="Bar"
                        data={data}
                        options={options}
                        chartEvents={this.chartEvents}
                    />)
            }
        }

        return (
            <div>
                <h2>{this.props.catalog} jobs afgelopen week</h2>
                {chart()}
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {...state.dashboard}
}

const mapDispatchToProps = {
    setJobsSummary,
    setBrutoNetto
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LastWeek));