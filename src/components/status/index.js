import React from "react";
import {Row, Col} from "react-bootstrap"
import {Card, CardContent} from "@datapunt/asc-ui"
import StatusDatabase from "./StatusDatabase";
import StatusOverview from "./StatusOverview";
import StatusQueues from "./StatusQueues";
import StatusServices from "./StatusServices";
import {getServices} from "./services/services";
import {getQueues} from "./services/queues";
import {getDbLocks, getDbQueries} from "../../services/gob_api";

class StatusPage extends React.Component {
    state = {
        services: {},
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
        const [services, queues, locks, queries] = [getServices(), getQueues(), getDbLocks(), getDbQueries()]
        this.setState({
            services: await services,
            queues: await queues,
            locks: await locks,
            queries: await queries});
    }

    render() {
        return (
            <div className="text-center">
                <h1>Status</h1>
                <Row>
                    <Col xs={12} md={8}>
                        <Card>
                            <CardContent>
                                <StatusOverview services={this.state.services}/>
                            </CardContent>
                        </Card>
                    </Col>
                    <Col>
                        <Card shadow backgroundColor="level2">
                            <CardContent>
                                <StatusDatabase locks={this.state.locks} queries={this.state.queries}/>
                            </CardContent>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Card>
                            <CardContent>
                                <StatusQueues queues={this.state.queues}/>
                            </CardContent>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <StatusServices services={this.state.services}/>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default StatusPage;
