import React from 'react';
import {connect} from "react-redux";

import {Button} from "@datapunt/asc-ui";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTimes} from '@fortawesome/free-solid-svg-icons'
import {setFilter} from "./jobsSlice";

class JobsFilterOverview extends React.Component {

    activeFilters = () => {
        const skipKeys = ["year", "month", "day"]
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
                            <Button className="mr-2 mb-2 small" variant="primaryInverted" key={value}
                                    onClick={() => this.closeFilter(key, value)}>
                                {value}&nbsp;
                                <FontAwesomeIcon icon={faTimes}/>
                            </Button>
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
