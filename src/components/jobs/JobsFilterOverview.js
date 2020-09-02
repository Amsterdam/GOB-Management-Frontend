import React from 'react';
import {connect} from "react-redux";

import {FilterTag} from "@datapunt/asc-ui";
import {setFilter} from "./jobsSlice";
import {filterTypes} from "./services/jobs";


class JobsFilterOverview extends React.Component {

    activeFilters = () => {
        const skipKeys = ["year", "month", "day"].concat(filterTypes
            .filter(f => f.hidden)
            .map(f => f.key))
        return Object.entries(this.props.filter)
            .filter(([key, values]) => !skipKeys.includes(key) && values.length > 0)
    }

    closeFilter = (key, value) => {
        const current = this.props.filter[key]
        this.props.setFilter({
            ...this.props.filter,
            [key]: current.filter(v => v !== value)
        })
    }

    render() {
        return (
            <div className="text-left">
                {this.activeFilters().map(([key, values]) => (
                    <span key={key}>
                        {values.map(value => (
                            <FilterTag className="mr-2 mb-2" key={value}
                                    onClick={() => this.closeFilter(key, value)}>
                                {value}
                            </FilterTag>
                        ))}
                    </span>
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

export default connect(mapStateToProps, mapDispatchToProps)(JobsFilterOverview);
