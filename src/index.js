import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import polyfill from './polyfill'
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';

polyfill();

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
