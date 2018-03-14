import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import 'babel-polyfill';
import CssBaselines from 'material-ui/CssBaseline';
import { MuiThemeProvider } from 'material-ui/styles';
import 'font-awesome/css/font-awesome.min.css';
import App from './containers/App';
import registerServiceWorker from './registerServiceWorker';
import constants from './constants';
import theme from './assets/theme';

ReactDOM.render(
  <BrowserRouter>
    <MuiThemeProvider theme={theme}>
      <div style={{
        minHeight: '100vh',
        backgroundColor: constants.brandColor.base.BLUE,
        backgroundImage: `linear-gradient(${constants.brandColor.light.BLUE}, ${constants.brandColor.base.BLUE})`,
        backgroundAttachment: 'fixed',
      }}
      >
        <CssBaselines />
        <App />
      </div>
    </MuiThemeProvider>
  </BrowserRouter>, document.getElementById('root'));
registerServiceWorker();
