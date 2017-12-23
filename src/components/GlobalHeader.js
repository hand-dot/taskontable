import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Grid from 'material-ui/Grid';
import IconButton from 'material-ui/IconButton';
import Menu, { MenuItem } from 'material-ui/Menu';

import LoginDialog from './LoginDialog';
import DescriptionDialog from './DescriptionDialog';
import HelpDialog from './HelpDialog';

import constants from '../constants';

import title from '../images/title.png';

const styles = {
  root: {
  },
  toolbar: {
    maxWidth: constants.APPWIDTH,
    margin: '0 auto',
  },
  title: {
    marginLeft: 10,
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
      isOpenHelpDialog: false,
    };
  }

  componentDidMount() {
    this.login();
    window.addEventListener('keydown', (e) => {
      // e.key === '?' はEdgeで動かないので e.keyCode === 191にしている
      if (e.ctrlKey && e.keyCode === 191) {
        this.setState({ isOpenHelpDialog: !this.state.isOpenHelpDialog });
      }
      return false;
    });
  }

  closeMenu() {
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
      window.open(constants.CONTACTURL);
    } else if (constants.menuItemKey.GIT === menuItemKey) {
      window.open(constants.REPOSITORYURL);
    }
  }

  closeDescriptionDialog() {
    this.setState({ isOpenDescriptionDialog: false });
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
    this.closeMenu();
    this.props.logoutCallback();
    this.openLoginDialog();
  }

  openLoginDialog() {
    this.setState({ isOpenLoginDialog: true });
  }

  closeLoginDialog() {
    this.setState({ isOpenLoginDialog: false });
  }

  openHelpDialog() {
    this.setState({ isOpenHelpDialog: true });
  }

  closeHelpDialog() {
    this.setState({ isOpenHelpDialog: false });
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
              <img src={title} alt="taskontable" height="25" className={classes.title} />
              <div>
                <IconButton onClick={this.handleMenu.bind(this)} data-menu-key="user">
                  <i className="fa fa-user-circle" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={this.state.openMenuKey === 'user'}
                  onRequestClose={this.closeMenu.bind(this)}
                >
                  <MenuItem>ユーザーID: {userId}</MenuItem>
                  <MenuItem onClick={this.logout.bind(this)}>
                    <i className="fa fa-sign-out" aria-hidden="true" />　ログアウト
                  </MenuItem>
                </Menu>
              </div>
              <div>
                <IconButton onClick={this.openHelpDialog.bind(this)}>
                  <i className="fa fa-question-circle" />
                </IconButton>
              </div>
              <div>
                <IconButton onClick={this.handleMenu.bind(this)} data-menu-key="info">
                  <i className="fa fa-info-circle" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={this.state.openMenuKey === 'info'}
                  onRequestClose={this.closeMenu.bind(this)}
                >
                  <MenuItem onClick={this.handleMenuItem.bind(this)} data-menu-item-key={constants.menuItemKey.DESCRIPTION}>
                    <i className="fa fa-info" aria-hidden="true" />
                    　サービスについて
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
          open={this.state.isOpenLoginDialog}
          changeUserId={changeUserId}
          login={this.login.bind(this)}
        />
        <DescriptionDialog
          open={this.state.isOpenDescriptionDialog}
          onRequestClose={this.closeDescriptionDialog.bind(this)}
        />
        <HelpDialog
          open={this.state.isOpenHelpDialog}
          onRequestClose={this.closeHelpDialog.bind(this)}
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
