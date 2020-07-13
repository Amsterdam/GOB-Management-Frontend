import { createSlice } from '@reduxjs/toolkit';
import {BRUTO} from "../dashboard/services/dashboard";

export const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState: {
        catalogs: [],
        catalog: null,
        jobsSummary: null,
        brutoNetto: BRUTO
    },
    reducers: {
        setCatalogs: (state, action) => {
            state.catalogs = action.payload
        },

        setCatalog: (state, action) => {
            state.catalog = action.payload
        },

        setJobsSummary: (state, action) => {
            state.jobsSummary = action.payload
        },

        setBrutoNetto: (state, action) => {
            state.brutoNetto = action.payload
        }
    },
});

export const { setCatalogs, setCatalog, setJobsSummary, setBrutoNetto } = dashboardSlice.actions;

export default dashboardSlice.reducer;
