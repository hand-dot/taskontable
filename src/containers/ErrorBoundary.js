// https://docs.sentry.io/clients/javascript/integrations/react/#expanded-usage
// https://reactjs.org/blog/2017/07/26/error-handling-in-react-16.html
import Raven from 'raven-js';
import { firebase } from '@firebase/app';
import '@firebase/auth';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import cat from '../images/cat.png';

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
            <Paper style={{ minHeight: '100vh' }} square elevation={0}>
              <div className={classes.content}>
                <Typography variant="title" gutterBottom>
                すみません。エラーが発生しちゃいました。
                </Typography>
                <img src={cat} style={{ width: '100%' }} alt="cat" />
                <Typography variant="caption" gutterBottom>
                エラーが発生した手順、状態を詳しく報告してくださるとなるべくはやく頑張って対応します。
                </Typography>
                <Button onClick={() => Raven.lastEventId() && Raven.showReportDialog()} variant="raised" color="primary" className={classes.button}>エラーを報告する</Button>
                <div style={{ fontSize: 12, marginBottom: 10 }}>
                  <a href="" onClick={() => { firebase.auth().signOut().then(() => { window.location.reload(); }); return false; }}>Topに戻る</a>
                </div>
              </div>
            </Paper>
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

