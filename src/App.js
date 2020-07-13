import React from 'react';
import {Route, Switch, BrowserRouter} from 'react-router-dom';

import {GlobalStyle, ThemeProvider} from '@datapunt/asc-ui'
import './App.css';

import AppHeader from "./components/common/AppHeader";
import HomePage from "./components/home";
import StatusPage from "./components/status";
import ManagementPage from "./components/management";
import JobsPage from "./components/jobs/JobsPage";
import JobDetailPage from "./components/jobs/JobDetailPage";
import DashboardPage from "./components/dashboard";

import {Container} from "react-bootstrap";
import AppErrorBoundary from "./AppErrorBoundary";

class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <ThemeProvider>
                    <GlobalStyle/>
                    <AppErrorBoundary>
                        <AppHeader/>
                        <Container>
                            <Switch>
                                <Route exact path={"/"} component={HomePage}/>
                                <Route path={"/status"} component={StatusPage}/>
                                <Route path={"/management"} component={ManagementPage}/>
                                <Route path={"/jobs/:id"} component={JobDetailPage}/>
                                <Route path={"/jobs"} component={JobsPage}/>
                                <Route path={"/dashboard"} component={DashboardPage}/>
                            </Switch>
                        </Container>
                    </AppErrorBoundary>
                </ThemeProvider>
            </BrowserRouter>
        )
    }
}

export default App;
