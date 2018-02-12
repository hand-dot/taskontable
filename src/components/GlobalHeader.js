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
import Hidden from 'material-ui/Hidden';
import Avatar from 'material-ui/Avatar';

import DescriptionDialog from './DescriptionDialog';
import HelpDialog from './HelpDialog';

import constants from '../constants';

import title from '../images/title_gr.png';

const styles = theme => ({
  root: {
    position: 'fixed',
    top: 0,
  },
  button: {
    padding: 3,
    fontSize: 11,
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
    color: 'rgba(0, 0, 0, 0.87)',
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
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.user.uid !== '') {
      this.setState({ login: true });
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
    }
  }

  closeDescriptionDialog() {
    this.setState({ isOpenDescriptionDialog: false });
  }

  logout() {
    this.closeMenu();
    setTimeout(() => this.props.logout());
  }

  render() {
    const { user, isOpenHelpDialog, openHelpDialog, closeHelpDialog, classes } = this.props;
    const { anchorEl } = this.state;

    return (
      <AppBar color="default" position="static" className={classes.root}>
        <Grid container alignItems="stretch" justify="center" spacing={0} className={classes.toolbar}>
          <Hidden xsDown>
            <Grid item xs={1} />
          </Hidden>
          <Grid item xs={12} sm={10}>
            <Toolbar>
              <Link className={classes.title} to="/"><img src={title} alt="taskontable" height="22" /></Link>
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
                </div>);
              })()}
            </Toolbar>
          </Grid>
          <Hidden xsDown>
            <Grid item xs={1} />
          </Hidden>
        </Grid>
        <DescriptionDialog
          open={this.state.isOpenDescriptionDialog}
          onClose={this.closeDescriptionDialog.bind(this)}
        />
        <HelpDialog
          open={isOpenHelpDialog}
          onClose={closeHelpDialog}
        />
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
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(GlobalHeader);
