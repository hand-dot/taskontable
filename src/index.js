import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import 'font-awesome/css/font-awesome.min.css';
import polyfill from './polyfill';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';

console.log(Date.now());
polyfill();

ReactDOM.render(<BrowserRouter><App /></BrowserRouter>, document.getElementById('root'));
registerServiceWorker();
