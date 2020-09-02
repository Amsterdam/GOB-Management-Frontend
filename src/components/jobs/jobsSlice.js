import { createSlice } from '@reduxjs/toolkit';

import {filterJobs, filterTypes} from "./services/jobs";
import {AGGREGATE_ON_JOB} from "../../services/gob";

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
            aggregateLevel: [AGGREGATE_ON_JOB],
            messageTypes: []
        },
        allJobs: [],    // Include process jobs
        allPrimaryJobs: [], // Only jobs without subjobs
        filteredJobs: [],
        filteredSlice: [],
        currentJob: {
            jobid: null,
            logs: []
        },
        currentProcessId: null
    },
    reducers: {
        setJobs: (state, action) => {
            const jobs = action.payload
            state.allJobs = jobs
            state.allPrimaryJobs = jobs.filter(job => job.aggregateLevel === AGGREGATE_ON_JOB)
            const filteredJobs = filterJobs(jobs, state.filter)
            state.filteredJobs = filteredJobs
            state.filteredSlice = filteredJobs.slice(0, 20)
        },

        setCurrentJob: (state, action) => {
            state.currentJob.jobid = action.payload.jobid
            state.currentJob.logs = action.payload.logs
        },

        setCurrentProcess: (state, action) => {
            state.currentProcessId = action.payload.processId
        },

        setFilter: (state, action) => {
            const filter = action.payload;
            // Convert year, month, day to integer values
            ["year", "month", "day"].forEach(f => filter[f] = filter[f].map(v => parseInt(v)))
            if (filter.aggregateLevel.length === 0 && state.filter.aggregateLevel.length > 0) {
                // Keep any existing level if no new aggregation level is specified
                filter.aggregateLevel = state.filter.aggregateLevel
            }
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

export const { setJobs, setCurrentJob, setCurrentProcess, setFilter, addSlice } = jobsSlice.actions;

export default jobsSlice.reducer;
