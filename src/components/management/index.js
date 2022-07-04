import React from "react";
import {connect} from "react-redux";

import {setCatalogCollections, setCatalog, setCollections, setAction, setProduct} from "./managementSlice";

import {Checkbox, Label, Radio, RadioGroup, FormTitle} from "@datapunt/asc-ui"

import {getCatalogCollections} from "./services/jobs";
import Form from "react-bootstrap/Form";

import JobStart from "./JobStart";
import {history2state, state2history} from "../../services/state2url";

class ManagementPage extends React.Component {
    stateVars = {
        catalog: this.props.setCatalog,
        collections: collections => this.props.setCollections(collections.split(",")),
        action: this.props.setAction,
        product: this.props.setProduct
    }

    initState = () => {
        history2state(this.props.history, this.stateVars, this.props)
        if (!this.props.catalog) {
            this.props.setCatalog(Object.keys(this.props.catalogCollections)[0])
        }
        state2history(this.props.history, this.stateVars, this.props)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        state2history(this.props.history, this.stateVars, this.props, prevProps)
    }

    componentDidMount = async () => {
        if (Object.keys(this.props.catalogCollections).length === 0) {
            const catalogCollections = await getCatalogCollections();
            this.props.setCatalogCollections(catalogCollections)
        }
        this.initState()
    }

    setCatalog = event => {
        this.props.setCatalog(event.target.value)
    }

    setCollection = event => {
        const {name, checked} = event.target
        if (checked) {
            this.props.setCollections([...this.props.collections, name])
        } else {
            this.props.setCollections(this.props.collections.filter(c => c !== name))
        }
    }

    setAction = event => {
        this.props.setAction(event.target.value)
    }

    render(args) {
        const catalogs = () => {
            return (
                <Form.Control as={"select"} onChange={this.setCatalog} value={this.props.catalog || ""}>
                    {Object.keys(this.props.catalogCollections).map(catalog => (
                        <option key={catalog}
                                name={catalog}
                                value={catalog}
                        >{catalog}</option>
                    ))}
                </Form.Control>
            )
        }

        const collections = () => {
            const catalog = this.props.catalog
            const hideCollections = this.props.hideCollections[catalog] || []
            const collections = this.props.catalogCollections[catalog] || []
            const disabled = this.props.catalogOnlyActions.includes(this.props.action)
            return (
                <div>
                    {collections.filter(collection => !hideCollections.includes(collection)).map(collection => (
                        <Label label={collection} key={collection} disabled={disabled}>
                            <Checkbox name={collection}
                                      variant="primary"
                                      onChange={this.setCollection}
                                      checked={this.props.collections.includes(collection)}
                                      inline
                                      label={collection}/>
                        </Label>
                    ))}
                </div>
            )
        }

        const actions = () => {
            const actions = this.props.actions
            return <RadioGroup onChange={this.setAction}>
                {actions.map(action => (
                    <Label label={action} key={action}>
                        <Radio variant="primary"
                               id={action} name={action} value={action}
                               checked={this.props.action === action}/>
                    </Label>
                ))}
            </RadioGroup>
        }

        return (
            <div>
                <FormTitle>
                    Nieuwe job starten
                </FormTitle>
                <Form>
                    <Form.Group className="w-50">
                        <Form.Label className="font-weight-bold">Catalog</Form.Label>
                        {catalogs()}
                    </Form.Group>
                    <Form.Group>
                        <Form.Label className="font-weight-bold">Collections</Form.Label>
                        {collections()}
                    </Form.Group>
                    <Form.Group>
                        <Form.Label className="font-weight-bold">Actions</Form.Label>
                        {actions()}
                    </Form.Group>
                    <Form.Group>
                        <JobStart title={"Start"}/>
                    </Form.Group>
                </Form>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {...state.management}
}

const mapDispatchToProps = {
    setCatalogCollections,
    setCatalog,
    setCollections,
    setAction,
    setProduct
}

export default connect(mapStateToProps, mapDispatchToProps)(ManagementPage);
