import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Button from 'material-ui/Button';
import Toolbar from 'material-ui/Toolbar';
import Grid from 'material-ui/Grid';
import IconButton from 'material-ui/IconButton';
import Menu, { MenuItem } from 'material-ui/Menu';
import Avatar from 'material-ui/Avatar';

import HelpDialog from '../components/HelpDialog';

import constants from '../constants';

import title from '../images/title_gr.png';

const styles = theme => ({
  root: {
    minHeight: theme.mixins.toolbar.minHeight,
  },
  button: {
    minWidth: 70,
    padding: 3,
    fontSize: 9,
    margin: theme.spacing.unit,
  },
  userPhoto: {
    width: 25,
    height: 25,
  },
  iconButton: {
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
  },
});

class GlobalHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: false,
      anchorEl: null,
      openMenuKey: '',
      isOpenDescriptionDialog: false,
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    if (window.Headway) window.Headway.init({ selector: '#changelog', account: constants.HEADWAY_ACCOUNT });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.user.uid !== '') {
      this.setState({ login: true });
      setTimeout(() => this.forceUpdate());
    } else {
      this.setState({ login: false });
    }
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
      window.open(constants.CONTACT_URL);
    } else if (constants.menuItemKey.GIT === menuItemKey) {
      window.open(constants.REPOSITORY_URL);
    } else if (constants.menuItemKey.ROADMAP === menuItemKey) {
      window.open(constants.ROADMAP_URL);
    }
  }

  closeDescriptionDialog() {
    this.setState({ isOpenDescriptionDialog: false });
  }

  logout() {
    this.closeMenu();
    setTimeout(() => this.props.logout());
  }

  goScripts() {
    this.closeMenu();
    setTimeout(() => this.props.goScripts());
  }

  render() {
    const { user, isOpenHelpDialog, openHelpDialog, closeHelpDialog, classes, theme } = this.props;
    const { anchorEl } = this.state;

    return (
      <AppBar color="default" position="fixed">
        <Grid container alignItems="stretch" justify="center" spacing={0} className={classes.toolbar}>
          <Grid item xs={12}>
            <Toolbar className={classes.root}>
              <Link className={classes.title} to="/"><img src={title} style={{ marginTop: 5 }} alt="taskontable" height="18" /></Link>
              {(() => {
                if (!this.state.login) {
                  return (<div style={{ display: 'inline-flex' }}>
                    <Link className={classes.link} to="/login"><Button variant="raised" className={classes.button}>ログイン</Button></Link>
                    <Link className={classes.link} to="/signup"><Button variant="raised" className={classes.button} color="primary" >アカウント作成</Button></Link>
                  </div>);
                }
                return (<div style={{ display: 'inline-flex' }}>
                  <div>
                    <IconButton className={classes.iconButton} onClick={this.handleMenu.bind(this)} data-menu-key="user">
                      {(() => {
                        if (user.photoURL) {
                          return <Avatar className={classes.userPhoto} src={user.photoURL} />;
                        }
                        return <i className="fa fa-user-circle" />;
                      })()}
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={this.state.openMenuKey === 'user'}
                      onClose={this.closeMenu.bind(this)}
                    >
                      <MenuItem>アカウント名: {user.displayName}</MenuItem>
                      {(() => {
                        if (theme.breakpoints.values.sm < constants.APPWIDTH) {
                          return (
                            <MenuItem onClick={this.goScripts.bind(this)}>
                              <i className="fa fa-code" aria-hidden="true" />　スクリプト設定
                            </MenuItem>
                          );
                        }
                        return null;
                      })()}
                      <MenuItem onClick={this.logout.bind(this)}>
                        <i className="fa fa-sign-out" aria-hidden="true" />　ログアウト
                      </MenuItem>
                    </Menu>
                  </div>
                  <div>
                    <IconButton className={classes.iconButton} onClick={openHelpDialog}>
                      <i className="fa fa-question-circle" />
                    </IconButton>
                  </div>
                  <div>
                    <IconButton className={classes.iconButton} onClick={this.handleMenu.bind(this)} data-menu-key="info">
                      <i className="fa fa-info-circle" />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={this.state.openMenuKey === 'info'}
                      onClose={this.closeMenu.bind(this)}
                    >
                      <MenuItem onClick={this.handleMenuItem.bind(this)} data-menu-item-key={constants.menuItemKey.CONTACT}>
                        <i className="fa fa-envelope-o" aria-hidden="true" />
                    　お問い合わせ
                      </MenuItem>
                      <MenuItem onClick={this.handleMenuItem.bind(this)} data-menu-item-key={constants.menuItemKey.ROADMAP}>
                        <i className="fa fa-trello" aria-hidden="true" />
                        ロードマップ
                      </MenuItem>
                      <MenuItem onClick={this.handleMenuItem.bind(this)} data-menu-item-key={constants.menuItemKey.GIT}>
                        <i className="fa fa-github" aria-hidden="true" />
                    　ソースコード
                      </MenuItem>
                    </Menu>
                  </div>
                </div>);
              })()}
              <div style={{ display: 'inline-flex' }}>

                <IconButton className={classes.iconButton}>
                  <i style={{ position: 'absolute', left: 10, top: 15, fontSize: 20, color: 'rgba(0, 0, 0, 0.54)' }} className="fa fa-bell-o" />
                  <span style={{ position: 'absolute', left: 10, top: 15 }} id="changelog" />
                </IconButton>
              </div>
            </Toolbar>
          </Grid>
        </Grid>
        <HelpDialog
          open={isOpenHelpDialog}
          onClose={closeHelpDialog}
        />
        <script async src="//cdn.headwayapp.co/widget.js" />
      </AppBar>
    );
  }
}

GlobalHeader.propTypes = {
  user: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    photoURL: PropTypes.string.isRequired,
    uid: PropTypes.string.isRequired,
  }).isRequired,
  isOpenHelpDialog: PropTypes.bool.isRequired,
  openHelpDialog: PropTypes.func.isRequired,
  closeHelpDialog: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  goScripts: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(GlobalHeader);
