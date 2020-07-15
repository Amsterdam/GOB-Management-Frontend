import React from "react";
import {connect} from "react-redux";
import {setCatalogs, setCatalog, setBrutoNetto, setJobsSummary} from "./dashboardSlice";
import {getCatalogCollections, getJobs, getJobsSummary} from "../../services/gob";
import Form from "react-bootstrap/Form";
import {getSearch, saveToUrl} from "../../services/state2url";
import JobSummaries from "./JobSummaries";
import LastWeek from "./LastWeek";
import LeadTimes from "./LeadTimes";
import running from "../jobs/assets/running.gif";
import {setJobs} from "../jobs/jobsSlice";
import {BRUTO} from "../dashboard/services/dashboard";

class DashboardPage extends React.Component {
    state = {
        loading: true
    }

    stateVars = {
        catalog: this.props.setCatalog
    }

    loadState = async () => {
        const params = getSearch(this.props.history)
        const catalog = params.get('catalog') || this.props.catalog || this.props.catalogs[0]
        const brutoNetto = params.get('brutoNetto') || this.props.brutoNetto || BRUTO
        this.props.setCatalog(catalog)
        this.props.setBrutoNetto(brutoNetto)
        saveToUrl(this.props.history, {
            catalog: catalog,
            brutoNetto: brutoNetto
        })
    }

    componentDidMount = async () => {
        this.setState({loading: true})
        // Load chart data in parallel
        const loaders = []
        if (this.props.catalogs.length === 0) {
            loaders.push(async () => {
                const catalogCollections = await getCatalogCollections()
                this.props.setCatalogs(Object.keys(catalogCollections))
            })
        }
        if (this.props.allJobs.length === 0) {
            loaders.push(async () => {
                const jobs = await getJobs({daysAgo: 7})
                this.props.setJobs(jobs)
            })
        }
        await Promise.all(loaders.map(loader => loader()))
        const summary = await getJobsSummary(this.props.allJobs);
        this.props.setJobsSummary(summary)
        this.loadState()
        this.setState({loading: false})
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.catalog !== this.props.catalog || prevProps.brutoNetto !== this.props.brutoNetto) {
            saveToUrl(this.props.history, {
                catalog: this.props.catalog,
                brutoNetto: this.props.brutoNetto
            })
        }
    }

    setCatalog = event => {
        this.props.setCatalog(event.target.value)
    }

    render() {
        const catalogsReady = this.props.catalogs.length > 0 && this.props.catalog

        const loading = () => {
            if (this.state.loading) {
                return (
                    <img src={running} alt="loading" height="20px" className={"ml-2"}/>
                )
            }
        }

        const catalogs = () => {
            if (catalogsReady) {
                return (
                    <Form.Control as={"select"}
                                  onChange={this.setCatalog}
                                  value={this.props.catalog || ""}>
                        {this.props.catalogs.map(catalog => (
                            <option key={catalog}
                                    name={catalog}
                                    value={catalog}
                            >{catalog}</option>
                        ))}
                    </Form.Control>
                )
            }
        }

        const charts = () => {
            if (!this.state.loading) {
                const charts = [<JobSummaries/>, <LastWeek/>, <LeadTimes/>]
                return (
                    <div className="mb-5">
                        {charts.map((chart, i) => (
                            <div key={i} className="mb-3">{chart}</div>
                        ))}
                    </div>
                )
            }
        }

        return (
            <div className="text-center">
                <h1>{this.props.catalog} dashboard</h1>
                {loading()}
                <div>
                    <Form className="col-4 offset-4">
                        <Form.Group>
                            {catalogs()}
                        </Form.Group>
                    </Form>
                </div>
                {charts()}
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
    setCatalogs,
    setCatalog,
    setBrutoNetto,
    setJobsSummary,
    setJobs
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardPage);
