import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import Menu, { MenuItem } from 'material-ui/Menu';

import LoginDialog from './LoginDialog';

import constants from '../constants';

const styles = {
  root: {
  },
  toolbar: {
    maxWidth: constants.appWidth,
    margin: '0 auto',
  },
  title: {
    marginRight: 'auto',
  },
};

class GlobalHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      isOpenLoginDialog: false,
    };
  }

  componentDidMount() {
    this.login();
  }

  handleMenu(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleRequestClose() {
    this.setState({ anchorEl: null });
  }

  login() {
    // FIXME localstrage実装は暫時対応
    const userId = localStorage.getItem('userId') || this.props.userId;
    if (userId) {
      localStorage.setItem('userId', userId);
      this.props.loginCallback(userId);
      this.closeLoginDialog();
    } else {
      this.openLoginDialog();
    }
  }

  logout() {
    // FIXME localstrage実装は暫時対応
    localStorage.removeItem('userId');
    this.handleRequestClose();
    this.props.logoutCallback();
    this.openLoginDialog();
  }

  openLoginDialog() {
    this.setState({ isOpenLoginDialog: true });
  }

  closeLoginDialog() {
    this.setState({ isOpenLoginDialog: false });
  }

  render() {
    const { userId, changeUserId, classes } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <AppBar position="static" color="default" className={classes.root}>
        <Grid container alignItems="stretch" justify="center" spacing={0} className={classes.toolbar}>
          <Grid item xs={1} />
          <Grid item xs={10}>
            <Toolbar>
              <Typography type="title" color="inherit" className={classes.title}>
              TaskChute WEB
              </Typography>
              <div>
                <IconButton
                  aria-owns={open ? 'menu-appbar' : null}
                  aria-haspopup="true"
                  onClick={this.handleMenu.bind(this)}
                >
                  <i className="fa fa-user-circle" />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={open}
                  onRequestClose={this.handleRequestClose.bind(this)}
                >
                  <MenuItem>ユーザーID: {userId}</MenuItem>
                  <MenuItem onClick={this.logout.bind(this)}>ログアウト</MenuItem>
                </Menu>
              </div>
            </Toolbar>
          </Grid>
          <Grid item xs={1} />
        </Grid>
        <LoginDialog
          userId={userId}
          isOpenLoginDialog={this.state.isOpenLoginDialog}
          changeUserId={changeUserId}
          login={this.login.bind(this)}
        />
      </AppBar>
    );
  }
}

GlobalHeader.propTypes = {
  userId: PropTypes.string.isRequired,
  changeUserId: PropTypes.func.isRequired,
  loginCallback: PropTypes.func.isRequired,
  logoutCallback: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(GlobalHeader);
