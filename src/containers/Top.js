import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import coffeeWoman from '../images/illust/coffee_woman.jpg';
import faceMan from '../images/illust/face_man.jpg';
import deskWoman from '../images/illust/desk_woman.jpg';
import elevatorMan from '../images/illust/elevator_man.jpg';
import skateboard from '../images/illust/skateboard.jpg';
import teamMens from '../images/illust/team_mens.jpg';
import Footer from '../components/Footer';
import constants from '../constants';

const styles = theme => ({
  content: {
    paddingTop: '3em',
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
});

function Top(props) {
  const { classes } = props;
  return (
    <Grid spacing={0} container alignItems="center" justify="center" style={{ backgroundColor: '#fffefc' }}>
      <Grid item xs={12}>
        <div className={classes.content} style={{ paddingTop: '7em' }}>
          <div className={classes.center}>
            <Typography variant="display3" align="center">
              タスクオンテーブル
            </Typography>
            <Typography variant="display3" align="center">
              T a s k o n t a b l e
            </Typography>
          </div>
        </div>
      </Grid>
      <Grid item xs={12}>
        <Grid spacing={0} container alignItems="center" justify="center" style={{ backgroundColor: '#fffefc' }}>
          <Grid style={{ textAlign: 'right' }} item xs={6} sm={4}>
            <img style={{ display: 'inline-block', maxWidth: 150 }} src={coffeeWoman} alt="coffeeWoman" />
          </Grid>
          <Grid item xs={6} sm={2}>
            <Typography align="left" style={{ marginBottom: 60 }}>
              &lt;Do We have to finish their tasks by today?
            </Typography>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Typography align="right" style={{ marginTop: 60 }}>
              Okay, let’s get it over with! &gt;
            </Typography>
          </Grid>
          <Grid style={{ textAlign: 'left' }} item xs={6} sm={4}>
            <img style={{ display: 'inline-block', maxWidth: 150 }} src={faceMan} alt="faceMan" />
          </Grid>
        </Grid>
      </Grid>
      <Grid className={classes.center} item xs={12}>
        <Typography gutterBottom variant="title" align="center">
          &lt; All you need  is Taskontable &gt;
        </Typography>
        <img style={{ display: 'inline-block', maxWidth: 300 }} src={deskWoman} alt="deskWoman" />
        <Link style={{ margin: '1em 0 3em' }} className={classes.link} to="/signup">
          <Button variant="raised" className={classes.button} color="primary" >Sign Up – It’s Free.</Button>
        </Link>
      </Grid>
      <Grid item xs={12} style={{ backgroundColor: constants.brandColor.base.SKIN }}>
        <div>
          <div className={classes.content}>
            <Typography variant="title" align="center" style={{ marginBottom: '2em' }}>
              {constants.TITLE} is To-Do List &amp; Time keeper on Spreadsheet.
            </Typography>
            {/* TODO ここはライブデモにする予定 */}
            <img className={classes.center} style={{ marginBottom: '2em', width: '100%' }} src="https://firebasestorage.googleapis.com/v0/b/taskontable.appspot.com/o/assets%2Fscreencapture.gif?alt=media&token=35183429-df91-490a-82e7-7f38a3ac127b" alt="taskontable" />
          </div>
        </div>
      </Grid>
      <Grid item xs={12}>
        <div className={classes.center}>
          <div className={classes.content}>
            <Grid spacing={0} container alignItems="center" justify="center">
              <Grid item xs={12} md={5}>
                <img className={classes.center} style={{ marginBottom: '2em', width: '100%', maxWidth: 300 }} src={elevatorMan} alt="elevatorMan" />
              </Grid>
              <Grid item xs={12} md={7}>
                <Typography variant="title" align="center" style={{ marginBottom: '2em' }}>
                  A tool for clearing tasks one by one. <br /> Single task is boost personal productivity.
                </Typography>
              </Grid>
            </Grid>
          </div>
        </div>
      </Grid>
      <Grid item xs={12}>
        <div className={classes.center}>
          <div className={classes.content}>
            <Grid spacing={0} container alignItems="center" justify="center">
              <Grid item xs={12} md={7}>
                <Typography variant="title" align="center" style={{ marginBottom: '2em' }}>
                  Modern &amp; classical interface. <br /> Simple, fast, beautiful, more fun.
                </Typography>
              </Grid>
              <Grid item xs={12} md={5}>
                <img className={classes.center} style={{ marginBottom: '2em', width: '100%', maxWidth: 300 }} src={skateboard} alt="skateboard" />
              </Grid>
            </Grid>
          </div>
        </div>
      </Grid>
      <Grid item xs={12}>
        <div className={classes.center}>
          <div className={classes.content}>
            <img className={classes.center} style={{ marginBottom: '2em', width: '100%', maxWidth: 600 }} src={teamMens} alt="teamMens" />
            <Typography variant="title" align="center" style={{ marginBottom: '2em' }}>
              Developed for individuals and teams. <br /> Can collaborate in realtime.
            </Typography>
          </div>
        </div>
      </Grid>
      <Footer />
    </Grid>
  );
}

Top.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(Top);

