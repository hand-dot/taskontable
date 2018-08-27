import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import CssBaselines from '@material-ui/core/CssBaseline';
import { MuiThemeProvider } from '@material-ui/core/styles';
import ErrorBoundary from './containers/ErrorBoundary';
import App from './containers/App';
import WithTracker from './containers/WithTracker';
import registerServiceWorker from './registerServiceWorker';
import quotations from './quotations';
import theme from './assets/theme';

console.log(`%c ${quotations[Math.floor(Math.random() * quotations.length)]} `, 'font-size: 40px; background: #222; color: #bada55;');

ReactDOM.render(
  <BrowserRouter>
    <MuiThemeProvider theme={theme}>
      <ErrorBoundary>
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#fffefc',
        }}
        >
          <CssBaselines />
          <Route component={WithTracker(App, { /* additional attributes */ })} />
        </div>
      </ErrorBoundary>
    </MuiThemeProvider>
  </BrowserRouter>,
  document.getElementById('root'),
);
registerServiceWorker();
