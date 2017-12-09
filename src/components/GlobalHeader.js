import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import AccountCircle from 'material-ui-icons/AccountCircle';
import Menu, { MenuItem } from 'material-ui/Menu';

import LoginDialog from './LoginDialog';

import constants from '../constants';

const styles = {
  root: {
    width: '100%',
  },
  toolbar: {
    width: constants.appWidth,
    margin: '0 auto',
  },
  flex: {
    flex: 1,
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
      <div className={classes.root}>
        <AppBar position="static" color="default">
          <Toolbar className={classes.toolbar}>
            <Typography type="title" color="inherit" className={classes.flex}>
              TaskChute WEB
            </Typography>
            <div>
              <IconButton
                aria-owns={open ? 'menu-appbar' : null}
                aria-haspopup="true"
                onClick={this.handleMenu.bind(this)}
              >
                <AccountCircle />
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
        </AppBar>
        <LoginDialog
          userId={userId}
          isOpenLoginDialog={this.state.isOpenLoginDialog}
          changeUserId={changeUserId}
          login={this.login.bind(this)}
        />
      </div>
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
