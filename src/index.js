import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import App from './App';
import store from './app/store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';

import moment from 'moment'
import 'moment/locale/nl'
import momentTz from 'moment-timezone'
momentTz.tz.setDefault("UTC");
moment.updateLocale('nl')

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
        <Router>
            <App />
        </Router>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
