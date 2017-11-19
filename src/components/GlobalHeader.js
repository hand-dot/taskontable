import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

const styles = theme => ({
  root: {
    marginBottom: theme.spacing.unit * 3,
    width: '100%',
  },
});

function GlobalHeader(props) {
  const { classes } = props;
  return (
    <div className={classes.root}>
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography type="title" color="inherit">
          TaskChute WEB
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
}

GlobalHeader.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(GlobalHeader);