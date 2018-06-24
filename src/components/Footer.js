import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';

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
  center: {
    display: 'block',
    margin: '0 auto',
    textAlign: 'center',
  },
});

function Footer(props) {
  const { classes } = props;
  return (
    <Grid spacing={0} container alignItems="stretch" justify="center">
      <Grid item xs={12}>
        <Paper style={{ backgroundColor: '#fffefc' }} square elevation={0}>
          <div className={classes.content}>
            <Divider style={{ margin: '1.5em 0' }} />
            <div className={classes.center}>
              <Typography variant="display3" align="center">
                タスクオンテーブル
              </Typography>
              <Typography variant="display3" align="center">
                T a s k o n t a b l e
              </Typography>
            </div>
            <Grid spacing={0} container alignItems="stretch" justify="center" style={{ paddingTop: '1.5em' }}>
              <Grid item xs={3} style={{ marginBottom: '2em' }} className={classes.center}>
                <a style={{ margin: '0 .4em' }} href={constants.CONTACT_URL} target="_blank">Contact</a>
              </Grid>
              <Grid item xs={2} style={{ marginBottom: '2em' }} className={classes.center}>
                <a style={{ margin: '0 .4em' }} href={constants.COMMUNITY_URL} target="_blank">Community</a>
              </Grid>
              <Grid item xs={2} style={{ marginBottom: '2em' }} className={classes.center}>
                <a style={{ margin: '0 .4em' }} href={constants.BLOG_URL} target="_blank">Blog</a>
              </Grid>
              <Grid item xs={2} style={{ marginBottom: '2em' }} className={classes.center}>
                <a style={{ margin: '0 .4em' }} href={constants.ROADMAP_URL} target="_blank">Roadmap</a>
              </Grid>
              <Grid item xs={3} style={{ marginBottom: '2em' }} className={classes.center}>
                <a style={{ margin: '0 .4em' }} href={constants.REPOSITORY_URL} target="_blank">Github</a>
              </Grid>
            </Grid>
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
}

Footer.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(Footer);

