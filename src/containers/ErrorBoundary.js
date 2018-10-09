// https://docs.sentry.io/clients/javascript/integrations/react/#expanded-usage
// https://reactjs.org/blog/2017/07/26/error-handling-in-react-16.html
import Raven from 'raven-js';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import constants from '../constants';
import util from '../utils/util';
import i18n from '../i18n';
import error from '../images/error.gif';


const auth = util.getAuth();

const styles = {
  root: {
    minHeight: '100vh',
  },
  content: {
    padding: '6em 2em',
    maxWidth: 660,
    margin: '0 auto',
    textAlign: 'center',
  },
  button: {
    marginTop: 15,
    marginBottom: 15,
    width: '100%',
  },
};

Raven.config(constants.SENTRY_URL, {
  release: constants.APP_VERSION,
  environment: process.env.NODE_ENV,
  shouldSendCallback: () => ['production', 'staging'].indexOf(process.env.NODE_ENV) !== -1,
}).install();

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(errorEvent, info) {
    this.setState({ hasError: true });
    Raven.captureException(errorEvent, { extra: info });
  }

  render() {
    const { hasError } = this.state;
    const { classes, children } = this.props;
    if (hasError) {
      // render fallback UI
      return (
        <Grid className={classes.root} container spacing={0} alignItems="stretch" justify="center">
          <Grid item xs={12}>
            <div style={{ minHeight: '100vh' }} className={classes.content}>
              <Typography variant="h6" gutterBottom>
                {i18n.t('errorBoundary.sorry')}
              </Typography>
              <img src={error} style={{ width: '100%' }} alt="cat" />
              <Typography variant="caption" gutterBottom>
                {i18n.t('errorBoundary.pleaseReport')}
              </Typography>
              <Button
                onClick={() => Raven.lastEventId() && Raven.showReportDialog()}
                variant="contained"
                color="primary"
                className={classes.button}
              >
                {i18n.t('errorBoundary.reportError')}
              </Button>
              <div style={{ fontSize: 12, marginBottom: 10 }}>
                <a href="" onClick={() => { auth.signOut().then(() => { window.location.replace(`${window.location.protocol}//${window.location.host}/`); }); return false; }}>
                  {i18n.t('common.backToTop')}
                </a>
              </div>
            </div>
          </Grid>
        </Grid>
      );
    }
    return children;
  }
}
ErrorBoundary.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line
  children: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles)(ErrorBoundary);
