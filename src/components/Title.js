import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import util from '../util';

const styles = {
  center: {
    display: 'block',
    margin: '0 auto',
    textAlign: 'center',
    fontStyle: 'italic',
  },
};

function Title(props) {
  const isMobile = util.isMobile();
  const { classes } = props;
  return (
    <div className={classes.center}>
      <Typography style={{ fontWeight: 'bold' }} variant={isMobile ? 'display1' : 'display3'} align="center">
      タスクオンテーブル
      </Typography>
      <Typography style={{ fontWeight: 'bold' }} variant={isMobile ? 'display1' : 'display3'} align="center">
      T a s k o n t a b l e
      </Typography>
    </div>
  );
}

Title.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(Title);

