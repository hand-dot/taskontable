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

import { contact, repository } from '../confings/admin';

import constants from '../constants';

const styles = {
  root: {
  },
  toolbar: {
    maxWidth: constants.APPWIDTH,
    margin: '0 auto',
  },
  title: {
    marginRight: 'auto',
  },
  link: {
    textDecoration: 'none',
    color: 'rgba(0, 0, 0, 0.87)',
  },
};

class GlobalHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      openMenuKey: '',
      isOpenLoginDialog: false,
      isOpenDescriptionDialog: false,
    };
  }

  componentDidMount() {
    this.login();
  }

  handleRequestClose() {
    this.setState({ anchorEl: null, openMenuKey: '' });
  }

  handleMenu(event) {
    const menuKey = event.currentTarget.getAttribute('data-menu-key');
    this.setState({ anchorEl: event.currentTarget, openMenuKey: menuKey });
  }

  handleMenuItem(event) {
    const menuItemKey = event.currentTarget.getAttribute('data-menu-item-key');
    if (constants.menuItemKey.DESCRIPTION === menuItemKey) {
      this.setState({ isOpenDescriptionDialog: true });
    } else if (constants.menuItemKey.CONTACT === menuItemKey) {
      window.open(contact);
    } else if (constants.menuItemKey.GIT === menuItemKey) {
      window.open(repository);
    }
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
                <IconButton onClick={this.handleMenu.bind(this)} data-menu-key="user">
                  <i className="fa fa-user-circle" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={this.state.openMenuKey === 'user'}
                  onRequestClose={this.handleRequestClose.bind(this)}
                >
                  <MenuItem>ユーザーID: {userId}</MenuItem>
                  <MenuItem onClick={this.logout.bind(this)}>
                    <i className="fa fa-sign-out" aria-hidden="true" />　ログアウト
                  </MenuItem>
                </Menu>
              </div>
              <div>
                <IconButton onClick={this.handleMenu.bind(this)} data-menu-key="info">
                  <i className="fa fa-info-circle" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={this.state.openMenuKey === 'info'}
                  onRequestClose={this.handleRequestClose.bind(this)}
                >
                  <MenuItem onClick={this.handleMenuItem.bind(this)} data-menu-item-key={constants.menuItemKey.DESCRIPTION}>
                    <i className="fa fa-question" aria-hidden="true" />
                    　サイトについて
                  </MenuItem>
                  <MenuItem onClick={this.handleMenuItem.bind(this)} data-menu-item-key={constants.menuItemKey.CONTACT}>
                    <i className="fa fa-envelope-o" aria-hidden="true" />
                    　お問い合わせ
                  </MenuItem>
                  <MenuItem onClick={this.handleMenuItem.bind(this)} data-menu-item-key={constants.menuItemKey.GIT}>
                    <i className="fa fa-github" aria-hidden="true" />
                    　ソースコード
                  </MenuItem>
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
