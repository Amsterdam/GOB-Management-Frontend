import React from 'react';
import {Form} from "react-bootstrap";

const JobLogFilter = props => {
    const {levels, filter, onChange} = props;

    return (
        <Form className="text-left">
            <Form.Group>
                {Object.entries(levels).map(([level, n]) => {
                    const checked = filter[level]
                    return (
                        <Form.Check type="checkbox"
                                    key={level}
                                    name={level}
                                    onChange={onChange}
                                    checked={checked}
                                    inline
                                    label={`${level} (${n})`}/>
                    )
                })}
            </Form.Group>
        </Form>
    )
}

export default JobLogFilter;
