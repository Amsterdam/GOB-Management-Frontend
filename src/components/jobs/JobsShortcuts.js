import * as React from 'react';
import {connect} from "react-redux";
import {Button} from "@datapunt/asc-ui";
import {setFilter} from "./jobsSlice";

class JobsShortcuts extends React.Component {

    shortcuts = {
        'Lopende recente jobs': {
            execution: ['lopende', 'recentste']
        },
        'Recente errors': {
            execution: ['recentste'],
            messageTypes: ['errors']
        }
    }

    setFilter = filterValues => {
        /**
         * Reset the jobs filter to a filter with only the shortcut items selected.
         */
        const filter = {...this.props.filter}
        Object.keys(filter).forEach(key => {
            if (filterValues[key]) {
                filter[key] = filterValues[key]
            } else {
                filter[key] = []
            }
        })
        this.props.setFilter(filter)
    }

    render() {
        return (
            <div>
                {Object.entries(this.shortcuts).map(([text, filterValues]) =>
                    <Button className="justify-content-center w-100 mb-2" key={text}
                            onClick={() => this.setFilter(filterValues)}>
                        {text}
                    </Button>
                )}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        filter: state.jobs.filter
    }
}

const mapDispatchToProps = {
    setFilter
}

export default connect(mapStateToProps, mapDispatchToProps)(JobsShortcuts)