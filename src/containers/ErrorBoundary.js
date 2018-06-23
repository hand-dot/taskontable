// https://docs.sentry.io/clients/javascript/integrations/react/#expanded-usage
// https://reactjs.org/blog/2017/07/26/error-handling-in-react-16.html
import Raven from 'raven-js';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import util from '../util';

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

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true });
    Raven.captureException(error, { extra: info });
  }

  render() {
    const { classes } = this.props;
    if (this.state.hasError) {
      // render fallback UI
      return (
        <Grid className={classes.root} container spacing={0} alignItems="stretch" justify="center">
          <Grid item xs={12}>
            <div style={{ minHeight: '100vh' }} className={classes.content}>
              <Typography variant="title" gutterBottom>
                すみません。エラーが発生しちゃいました。
              </Typography>
              <img src="https://firebasestorage.googleapis.com/v0/b/taskontable.appspot.com/o/assets%2Fcat.png?alt=media&token=ad2ea5c2-1a0b-4261-92ee-5d99dbe6c4da" style={{ width: '100%' }} alt="cat" />
              <Typography variant="caption" gutterBottom>
                エラーが発生した手順、状態を詳しく報告してくださるとなるべくはやく頑張って対応します。
              </Typography>
              <Button onClick={() => Raven.lastEventId() && Raven.showReportDialog()} variant="raised" color="primary" className={classes.button}>エラーを報告する</Button>
              <div style={{ fontSize: 12, marginBottom: 10 }}>
                <a href="" onClick={() => { auth.signOut().then(() => { window.location.replace(`${window.location.protocol}//${window.location.host}/`); }); return false; }}>Topに戻る</a>
              </div>
            </div>
          </Grid>
        </Grid>
      );
    }
    return this.props.children;
  }
}
ErrorBoundary.propTypes = {
    classes: PropTypes.object.isRequired, // eslint-disable-line
    children: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles)(ErrorBoundary);

