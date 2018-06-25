import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';

import constants from '../constants';
import util from '../util';
import i18n from '../i18n/';

const styles = theme => ({
  content: {
    paddingTop: util.isMobile ? '2em' : '3em',
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
  const isMobile = util.isMobile();
  const { classes } = props;
  return (
    <Grid spacing={0} container alignItems="stretch" justify="center">
      <Grid item xs={12}>
        <Paper style={{ backgroundColor: '#fffefc' }} square elevation={0}>
          <div className={classes.content}>
            <Divider style={{ margin: '0 0 7em' }} />
            <div className={classes.center}>
              <Typography variant={isMobile ? 'display1' : 'display3'} align="center">
                タスクオンテーブル
              </Typography>
              <Typography variant={isMobile ? 'display1' : 'display3'} align="center">
                T a s k o n t a b l e
              </Typography>
            </div>
            <Grid spacing={0} container alignItems="stretch" justify="center" style={{ paddingTop: '7em' }}>
              <Grid item xs={12} sm={3} style={{ marginBottom: '2em' }} className={classes.center}>
                <a style={{ margin: '0 .4em' }} href={constants.CONTACT_URL} target="_blank">{i18n.t('common.contact')}</a>
              </Grid>
              <Grid item xs={12} sm={2} style={{ marginBottom: '2em' }} className={classes.center}>
                <a style={{ margin: '0 .4em' }} href={constants.COMMUNITY_URL} target="_blank">{i18n.t('common.community')}</a>
              </Grid>
              <Grid item xs={12} sm={2} style={{ marginBottom: '2em' }} className={classes.center}>
                <a style={{ margin: '0 .4em' }} href={constants.BLOG_URL} target="_blank">{i18n.t('common.blog')}</a>
              </Grid>
              <Grid item xs={12} sm={2} style={{ marginBottom: '2em' }} className={classes.center}>
                <a style={{ margin: '0 .4em' }} href={constants.ROADMAP_URL} target="_blank">{i18n.t('common.roadMap')}</a>
              </Grid>
              <Grid item xs={12} sm={3} style={{ marginBottom: '2em' }} className={classes.center}>
                <a style={{ margin: '0 .4em' }} href={constants.REPOSITORY_URL} target="_blank">{i18n.t('common.github')}</a>
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

