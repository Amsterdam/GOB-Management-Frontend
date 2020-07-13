import { configureStore } from '@reduxjs/toolkit';
import managementReducer from '../components/management/managementSlice'
import jobsReducer from '../components/jobs/jobsSlice'
import dashboardReducer from '../components/dashboard/dashboardSlice'

export default configureStore({
  reducer: {
    management: managementReducer,
    jobs: jobsReducer,
    dashboard: dashboardReducer
  },
  middleware: []
});
