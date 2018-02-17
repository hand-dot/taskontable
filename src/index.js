import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import 'babel-polyfill';
import 'font-awesome/css/font-awesome.min.css';
import App from './containers/App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<BrowserRouter><App /></BrowserRouter>, document.getElementById('root'));
registerServiceWorker();
