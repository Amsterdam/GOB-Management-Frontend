import React from 'react';
import {connect} from "react-redux";

import * as _ from 'lodash';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faHome} from '@fortawesome/free-solid-svg-icons'
import {Accordion} from "@datapunt/asc-ui";
import {Button, FormCheck, FormGroup} from "react-bootstrap";
import {setFilter} from "./jobsSlice";
import {filterName, MESSAGE_TYPES, filterTypes, messageTypes} from "./services/jobs";

class JobFilters extends React.Component {
    activeFilters = () => {
        return filterTypes
            .map(filterType => ({
                ...filterType,
                options: this.filterOptions(filterType.key)
            }))
            .filter(filterType => filterType.options.length > 0)
    }

    filterOptions = key => {
        const options = this.props.jobs
            .filter(job => (key === "entity" ? !["rel"].includes(job.catalogue) : true))
            .map(job => job[key])
            .concat(this.props.filter[key])
            .filter(k => k)
            .map(k => filterName(k))
            .sort()
        return _.uniq(options)
    }

    toggleFilterOption = (filterType, filterOption) => {
        const {filter} = this.props;

        if (filter[filterType].includes(filterOption)) {
            this.props.setFilter({
                ...filter,
                [filterType]: filter[filterType].filter(option => option !== filterOption)
            })
        } else {
            this.props.setFilter({
                ...filter,
                [filterType]: [...filter[filterType], filterOption]
            })
        }
    }

    scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    render() {
        return (
            <div>
                <div className="mb-2">
                    <Accordion isOpen={true} id={MESSAGE_TYPES} title={"Type meldingen"}>
                        <FormGroup>
                            {messageTypes.map(({text, key}) => (
                                <FormCheck key={key}
                                           name={text}
                                           label={text}
                                           checked={(this.props.filter.messageTypes || []).includes(key)}
                                           onChange={() => this.toggleFilterOption(MESSAGE_TYPES, key)}
                                />
                            ))}
                        </FormGroup>
                    </Accordion>
                </div>

                {this.activeFilters().map(filterType => (
                    <div key={filterType.key} className="mb-2">
                        <Accordion isOpen={true} key={filterType.key} id={filterType.key} title={filterType.text}>
                            <FormGroup>
                                {filterType.options.map(filterOption => (
                                    <FormCheck key={filterOption}
                                               name={filterOption}
                                               label={filterOption}
                                               checked={this.props.filter[filterType.key].includes(filterOption)}
                                               onChange={() => this.toggleFilterOption(filterType.key, filterOption)}
                                    />
                                ))}
                                <Button title="Ga naar begin pagina" variant="light" size="sm" className="float-right small mr-n2">
                                    <FontAwesomeIcon icon={faHome} onClick={this.scrollToTop}/>
                                </Button>
                            </FormGroup>
                        </Accordion>
                    </div>
                ))}

            </div>
        )
    }
}

function mapStateToProps(state) {
    return {...state.jobs}
}

const mapDispatchToProps = {
    setFilter
}

export default connect(mapStateToProps, mapDispatchToProps)(JobFilters);
