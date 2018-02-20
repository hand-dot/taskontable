import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import 'babel-polyfill';
import Reboot from 'material-ui/Reboot';
import 'font-awesome/css/font-awesome.min.css';
import App from './containers/App';
import registerServiceWorker from './registerServiceWorker';
import constants from './constants';

ReactDOM.render(
  <BrowserRouter>
    <div style={{
      height: '100vh',
      backgroundColor: constants.brandColor.base.BLUE,
      backgroundImage: `linear-gradient(${constants.brandColor.light.BLUE}, ${constants.brandColor.base.BLUE})`,
      backgroundAttachment: 'fixed',
    }}
    >
      <Reboot />
      <App />
    </div>
  </BrowserRouter>, document.getElementById('root'));
registerServiceWorker();
