import React, { Component } from 'react';
import {connect} from "react-redux";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './JobsCalendar.css'
import {setFilter} from "./jobsSlice";

class JobsCalendar extends Component {
    onChange = date => {
        const selectedDate = this.selectedDate()
        if (selectedDate && date.getTime() === selectedDate.getTime()) {
            // date toggle
            this.props.setFilter({
                ...this.props.filter,
                year: [],
                month: [],
                day: []
            })
        } else {
            this.props.setFilter({
                ...this.props.filter,
                year: [date.getFullYear()],
                month: [date.getMonth() + 1],
                day: [date.getDate()]
            })
        }
    }

    selectedDate = () => {
        const {year, month, day} = this.props.filter
        if ([year, month, day].every(v => v.length === 1)) {
            // Single date selection
            return new Date(year[0], month[0] - 1, day[0])
        } else {
            return null
        }
    }

    render() {
        let minDate, maxDate;
        const date = this.selectedDate()

        this.props.jobs.forEach(job => {
            const dt = new Date(job.date)
            if (!minDate || dt < minDate ) {
                minDate = dt
            }
            if (!maxDate || dt > maxDate) {
                maxDate = dt
            }
        })

        return (
            <div className="mb-2 w-100">
                <Calendar
                    locale={"nl"}
                    onChange={this.onChange}
                    value={date}
                    minDate={minDate}
                    maxDate={maxDate}
                />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {...state.jobs}
}

const mapDispatchToProps = {
    setFilter
}

export default connect(mapStateToProps, mapDispatchToProps)(JobsCalendar)