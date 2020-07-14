import React from 'react'
import {connect} from "react-redux";

import Chart from "react-google-charts";

import {defaultOrdering} from "./services/dashboard";
import {setJobsSummary, setBrutoNetto} from "./dashboardSlice";
import {getJobsSummary} from "../../services/gob";
import {Label, Radio, RadioGroup} from "@datapunt/asc-ui";
import {BRUTO, NETTO} from "../dashboard/services/dashboard";

class LeadTimes extends React.Component {
    state = {
        chartData: null,
        chartOptions: {
            axes: {
                y: {
                    0: {
                        label: "Doorlooptijd (min)"
                    }
                }
            }
        }
    }

    componentDidMount = async () => {
        if (this.props.jobsSummary) {
            this.loadData()
        }
    }

    loadData = async () => {
        /**
         * Load jobs summary and sets chartData.
         *
         * this.chartData = {
         *     bag: {
         *         netto: [
         *             ['date', 'import', 'export' ....],
         *             ['14-4', a, b, ....],
         *             ['15-4', c, d, ....],
         *             ...
         *         ],
         *         bruto: [
         *             ...
         *         ]
         *     },
         *     brk: {...},
         *     ...
         * }
         *
         * where a, b, c and d are the average running times for each job on each date in minutes
         */
        const ordering = defaultOrdering;
        const summary = this.props.jobsSummary;

        function firstEntry(obj) {
            // Return first entry in object.
            let keys = Object.keys(obj);
            return keys.length ? obj[keys[0]] : null;
        }

        const jobTypes = Object.keys(firstEntry(firstEntry(summary))).filter(
            t => ordering.indexOf(t) > -1
        ).sort((t1, t2) => ordering.indexOf(t1) - ordering.indexOf(t2));

        const firstRow = new Array(jobTypes.length + 1);
        firstRow[0] = "";
        for (const jobType of jobTypes) {
            // Index according to ordering. Skip unknown job types.
            firstRow[jobTypes.indexOf(jobType) + 1] = jobType;
        }

        const chartData = {};
        for (const [catalog, summaryData] of Object.entries(summary)) {
            const catalogData = {
                bruto: [[...firstRow]],
                netto: [[...firstRow]]
            };

            for (const [date, jobs] of Object.entries(summaryData)) {
                const nettoRow = new Array(firstRow.length);
                const brutoRow = new Array(firstRow.length);
                nettoRow[0] = brutoRow[0] = date;

                for (const [name, job] of Object.entries(jobs)) {
                    const idx = firstRow.indexOf(name);

                    if (idx !== -1) {
                        nettoRow[idx] = job.jobs.length
                            ? job.netto_total / 60 / job.jobs.length
                            : 0;
                        brutoRow[idx] = job.jobs.length
                            ? job.bruto_total / 60 / job.jobs.length
                            : 0;
                    }
                }
                catalogData.bruto.push(brutoRow);
                catalogData.netto.push(nettoRow);
            }
            chartData[catalog] = catalogData;
        }
        this.setState({chartData})
    }

    setBrutoNetto = event => {
        this.props.setBrutoNetto(event.target.value)
    }

    render() {
        const hasData = this.state.chartData && this.props.catalog

        const chart = () => {
            if (hasData) {
                const data = this.state.chartData[this.props.catalog][this.props.brutoNetto]
                const options = this.state.chartOptions
                return (
                    <Chart chartType="Line"
                           loader={<div>Loading Chart</div>}
                           data={data}
                           options={options}
                    />)
            } else {
                return (<div>Geen data gevonden</div>)
            }
        }

        const radios = () => {
            if (hasData) {
                return (
                    <RadioGroup horizontal onChange={this.setBrutoNetto}>
                        {[BRUTO, NETTO].map(value => (
                            <Label label={value} key={value}>
                                <Radio variant="primary"
                                       id={value} name={value} value={value}
                                       checked={this.props.brutoNetto === value}/>
                            </Label>
                        ))}
                    </RadioGroup>
                )
            }
        }

        return (
            <div>
                <h2>Gemiddelde {this.props.brutoNetto} doorlooptijden</h2>
                {chart()}
                {radios()}
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

export default connect(mapStateToProps, mapDispatchToProps)(LeadTimes);