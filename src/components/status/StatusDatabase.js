import React from "react";

class StatusDatabase extends React.Component {
    render() {
        return (
            <div>
                <h3>Database</h3>
                <div>
                    <h4>Locks: {this.props.locks.length}</h4>
                </div>
                <div>
                    <h4>Queries: {this.props.queries.length}</h4>
                    {this.props.queries.map((query, index) => (
                        <div key={index}>
                            {query.concat} ({query.duration_minutes} minutes)
                        </div>
                    ))}
                </div>
            </div>
        )
    }
}


export default StatusDatabase;
