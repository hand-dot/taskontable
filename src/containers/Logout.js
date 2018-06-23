import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Footer from '../components/Footer';
import constants from '../constants';
import util from '../util';

const styles = theme => ({
  content: {
    paddingTop: util.isMobile ? '7em' : '3em',
    paddingBottom: '3em',
    paddingLeft: 10,
    paddingRight: 10,
    maxWidth: 960,
    margin: '0 auto',
  },
  textBox: {
    maxWidth: 600,
    margin: '0 auto',
  },
  link: {
    textDecoration: 'none',
    display: 'block',
  },
  button: {
    margin: theme.spacing.unit,
  },
  center: {
    display: 'block',
    margin: '0 auto',
    textAlign: 'center',
  },
  stroke: {
    color: '#eee',
    WebkitTextStroke: '1px #999',
  },
});

function Logout(props) {
  const { classes } = props;
  return (
    <Grid spacing={0} container alignItems="stretch" justify="center">
      <Grid item xs={12}>
        <div className={classes.center}>
          <div className={classes.content}>
            <Typography className={classes.stroke} variant="display3" align="center" style={{ marginTop: '0.5em', marginBottom: '0.5em' }}>
              Did You Build Your Workflow?
            </Typography>
            <Typography variant="headline" align="center" style={{ marginBottom: '2em' }}>
            お使いいただきありがとうございました。<br />{constants.TITLE}からログアウトしました。
            </Typography>
            <div style={{ fontSize: 12, marginTop: 20 }}>
              <Link to="/">Topに戻る</Link>
            </div>
          </div>
        </div>
      </Grid>
      <Footer />
    </Grid>
  );
}

Logout.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(Logout);

