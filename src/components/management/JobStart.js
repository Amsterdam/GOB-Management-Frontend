import React from "react";
import { withRouter } from 'react-router-dom'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlay} from '@fortawesome/free-solid-svg-icons'

import Form from "react-bootstrap/Form";

import {canStartJob, startJob} from "./services/jobs";
import {setProduct} from "./managementSlice";
import {connect} from "react-redux";
import {Input, Button} from "@datapunt/asc-ui";

class JobStart extends React.Component {
    productPlaceholders = {
        Export: "Optionally enter the name of the export file",
        Relate: "Optionally enter the name of an attribute"
    }

    state = {
        results: [],
        startingJobs: false
    }

    canStartJob = () => {
        return !this.state.startingJobs &&
            canStartJob(this.props.action, this.props.catalog, this.props.collections)
    }

    startJob = async () => {
        const results = []
        this.setState({results, startingJobs: true})

        for (let collection of this.props.collections) {
            const result = await startJob(this.props.action, this.props.catalog, collection,
                this.props.product)
            results.push(result)
            this.setState({results})
        }

        this.setState({startingJobs: false})
    }

    onProduct = (event) => {
        this.props.setProduct(event.target.value)
    }

    render() {
        const products = () => {
            if (this.props.productActions.includes(this.props.action)) {
                const product = this.props.product
                return (
                    <Form.Group>
                        <Input onChange={this.onProduct}
                               value={product}
                               placeholder={this.productPlaceholders[this.props.action]}/>
                    </Form.Group>
                )
            }
        }

        const results = () => {
            return this.state.results.map((result, i) => (
                <div key={i} className={result.ok ? "INFO" : "ERROR"}>{result.text}</div>
            ))
        }

        return (
            <div>
                {products()}
                <div className={"text-center"}>
                    <Button onClick={this.startJob} disabled={!this.canStartJob()}>
                        <FontAwesomeIcon icon={faPlay}/>&nbsp;
                        {this.props.title}&nbsp;{this.props.action}&nbsp;{this.props.product[this.props.action]}
                    </Button>
                </div>
                <div className={"mt-2 text-center"}>
                    {results()}
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {...state.management}
}

const mapDispatchToProps = {
    setProduct
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(JobStart));