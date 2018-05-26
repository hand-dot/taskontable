import Raven from 'raven-js';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import CssBaselines from '@material-ui/core/CssBaseline';
import { MuiThemeProvider } from '@material-ui/core/styles';
import ErrorBoundary from './containers/ErrorBoundary';
import App from './containers/App';
import WithTracker from './containers/WithTracker';
import registerServiceWorker from './registerServiceWorker';
import constants from './constants';
import quotations from './quotations';
import theme from './assets/theme';

console.log(`%c ${quotations[Math.floor(Math.random() * quotations.length)]} `, 'font-size: 40px; background: #222; color: #bada55;');

Raven.config(constants.SENTRY_URL, {
  release: constants.APP_VERSION,
  environment: process.env.NODE_ENV,
  shouldSendCallback: () => ['production', 'staging'].indexOf(process.env.NODE_ENV) !== -1,
}).install();

ReactDOM.render(
  <BrowserRouter>
    <MuiThemeProvider theme={theme}>
      <ErrorBoundary>
        <div style={{
          minHeight: '100vh',
          backgroundColor: constants.brandColor.base.BLUE,
          transformOrigin: 0,
          backgroundImage: `linear-gradient(150deg,${constants.brandColor.light.PURPLE} 15%,${theme.palette.primary.main} 70%,${constants.brandColor.base.GREEN} 94%)`,
          backgroundAttachment: 'fixed',
        }}
        >
          <CssBaselines />
          <Route component={WithTracker(App, { /* additional attributes */ })} />
        </div>
      </ErrorBoundary>
    </MuiThemeProvider>
  </BrowserRouter>
  , document.getElementById('root'),
);
registerServiceWorker();
