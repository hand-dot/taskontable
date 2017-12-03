import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import AccountCircle from 'material-ui-icons/AccountCircle';


const styles = theme => ({
  root: {
    marginBottom: theme.spacing.unit * 3,
    width: '100%',
  },
  icons: {
    marginTop: 5,
    right: 20,
    position: 'absolute',
  },
});

function GlobalHeader(props) {
  const { classes, userId } = props;
  return (
    <div className={classes.root}>
      <AppBar position="static" color="default">
        <Toolbar style={{ minWidth: 960, margin: '0 auto' }}>
          <Typography type="title" color="inherit">
            TaskChute WEB
          </Typography>
          <div className={classes.icons} title={`ユーザーID : ${userId}`}><AccountCircle /></div>
        </Toolbar>
      </AppBar>
    </div>
  );
}

GlobalHeader.propTypes = {
  classes: PropTypes.object.isRequired,
  userId: PropTypes.string.isRequired,
};

export default withStyles(styles)(GlobalHeader);
