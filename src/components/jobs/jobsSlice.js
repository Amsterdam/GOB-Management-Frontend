import { createSlice } from '@reduxjs/toolkit';

import {filterJobs, filterTypes} from "./services/jobs";

export const jobsSlice = createSlice({
    name: 'jobs',
    initialState: {
        sort: {
            field: null,
            direction: 1
        },
        search: null,
        filter: {
            year: [],
            month: [],
            day: [],
            ...filterTypes.reduce((obj, ft) => ({...obj, [ft.key]: []}), {}),
            messageTypes: []
        },
        allJobs: [],
        filteredJobs: [],
        filteredSlice: [],
        currentJob: {
            jobid: null,
            logs: []
        }
    },
    reducers: {
        setJobs: (state, action) => {
            const jobs = action.payload
            state.allJobs = jobs
            const filteredJobs = filterJobs(jobs, state.filter)
            state.filteredJobs = filteredJobs
            state.filteredSlice = filteredJobs.slice(0, 20)
        },

        setCurrentJob: (state, action) => {
            state.currentJob.jobid = action.payload.jobid
            state.currentJob.logs = action.payload.logs
        },

        setFilter: (state, action) => {
            const filter = action.payload;
            // Convert year, month, day to integer values
            ["year", "month", "day"].forEach(f => filter[f] = filter[f].map(v => parseInt(v)))
            state.filter = filter
            const filteredJobs = filterJobs(state.allJobs, filter)
            state.filteredJobs = filteredJobs
            state.filteredSlice = filteredJobs.slice(0, 20)
        },

        addSlice: (state, payload) => {
            const currentIndex = state.filteredSlice.length
            const moreJobs = state.filteredJobs.slice(currentIndex, currentIndex + 20)
            state.filteredSlice = state.filteredSlice.concat(moreJobs)
        }
    },
});

export const { setJobs, setCurrentJob, setFilter, addSlice } = jobsSlice.actions;

export default jobsSlice.reducer;
