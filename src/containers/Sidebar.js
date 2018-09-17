import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Hidden from '@material-ui/core/Hidden';
import Drawer from '@material-ui/core/Drawer';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Add from '@material-ui/icons/Add';
import util from '../utils/util';
import i18n from '../i18n';
import constants from '../constants';
import sharp from '../images/sharp.svg';

const database = util.getDatabase();

const styles = theme => ({
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    position: 'relative',
    minHeight: '100%',
    width: constants.SIDEBAR_WIDTH,
    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
  },
});

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newWorksheetName: '',
      isOpenCreateWorksheetModal: false,
    };
  }

  createWorksheet() {
    const {
      newWorksheetName,
    } = this.state;
    const {
      userId,
      worksheets,
      handleWorksheets,
      handleSnackbar,
    } = this.props;
    if (newWorksheetName === '') {
      alert(i18n.t('validation.must_target', { target: i18n.t('common.worksheetName') }));
      return;
    }
    if (!util.validateDatabaseKey(newWorksheetName)) {
      alert(i18n.t('validation.containsForbiddenCharacter_target', { target: i18n.t('common.worksheetName') }));
      return;
    }
    // ワークシートのIDはシート名をtoLowerCaseしてencodeURIしたものにするシート名はシート名で別管理する
    const newWorksheetId = util.formatURLString(newWorksheetName);
    // ワークシートのIDが存在しない場合は作成できる。
    database.ref(`/${constants.API_VERSION}/worksheets/${newWorksheetId}/`).once('value').then((snapshot) => {
      if (snapshot.exists()) {
        alert(i18n.t('validation.cantCreate_target', { target: i18n.t('common.worksheetName') }));
      } else {
        Promise.all([
          database.ref(`/${constants.API_VERSION}/users/${userId}/worksheets/`).set(worksheets.map(worksheet => worksheet.id).concat([newWorksheetId])),
          database.ref(`/${constants.API_VERSION}/worksheets/${newWorksheetId}/`).set({ members: [userId], name: newWorksheetName, disclosureRange: constants.worksheetDisclosureRange.PRIVATE }),
        ]).then(() => {
          handleWorksheets(worksheets.concat([{ id: newWorksheetId, name: newWorksheetName }]));
          handleSnackbar({ isOpen: true, message: i18n.t('common.wasCreated_target', { target: newWorksheetName }) });
          this.goWorkSheet(newWorksheetId);
          this.setState({
            newWorksheetName: '',
            isOpenCreateWorksheetModal: false,
          });
        });
      }
    });
  }

  goWorkSheet(id) {
    const { history, handleSidebar } = this.props;
    history.push('/');
    setTimeout(() => { history.push(`/${id}`); });
    if (util.isMobile()) handleSidebar({ isOpen: false });
  }

  render() {
    const {
      open, handleSidebar, worksheets, location, classes, theme,
    } = this.props;
    const {
      isOpenCreateWorksheetModal,
      newWorksheetName,
    } = this.state;
    return (
      <Drawer
        variant={util.isMobile() ? 'temporary' : 'persistent'}
        open={open}
        onClose={() => handleSidebar({ isOpen: false })}
        style={{ display: open ? 'block' : 'none' }}
        classes={{ paper: classes.drawerPaper }}
      >
        <Hidden xsDown>
          <div style={{ height: theme.spacing.unit }} />
          <div className={classes.toolbar} />
        </Hidden>
        <List component="nav">
          <ListItem divider button onClick={this.goWorkSheet.bind(this, '')} disabled={location.pathname === '/'} style={{ backgroundColor: location.pathname === '/' ? 'rgba(0, 0, 0, 0.08)' : '' }}>
            <ListItemIcon>
              <span role="img" aria-label="Hello">
              😜
              </span>
            </ListItemIcon>
            <ListItemText primary="Hello" />
          </ListItem>
          {worksheets.map((worksheet) => {
            const isActive = util.formatURLString(location.pathname.replace('/', '')) === util.formatURLString(worksheet.name);
            return (
              <ListItem divider key={worksheet.id} button onClick={this.goWorkSheet.bind(this, worksheet.id)} disabled={isActive} style={{ backgroundColor: isActive ? 'rgba(0, 0, 0, 0.08)' : '' }}>
                <ListItemIcon>
                  <img src={sharp} alt="channel" width="21" height="26" />
                </ListItemIcon>
                <ListItemText key={worksheet.id} primary={worksheet.name} />
              </ListItem>
            );
          })}
          <ListItem
            divider
            button
            onClick={() => {
              this.setState({ isOpenCreateWorksheetModal: true });
            }}
          >
            <ListItemIcon>
              <Add />
            </ListItemIcon>
            <ListItemText primary={i18n.t('common.createNew')} />
          </ListItem>
        </List>
        <Dialog
          fullWidth
          open={isOpenCreateWorksheetModal}
          onClose={() => { this.setState({ isOpenCreateWorksheetModal: false }); }}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">
            {i18n.t('app.createWorksheet')}
          </DialogTitle>
          <DialogContent>
            <TextField
              onChange={(e) => { this.setState({ newWorksheetName: e.target.value }); }}
              value={newWorksheetName}
              autoFocus
              margin="dense"
              id="name"
              label={i18n.t('common.worksheetName')}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button size="small" onClick={() => { this.setState({ newWorksheetName: '', isOpenCreateWorksheetModal: false }); }} color="primary">
              {i18n.t('common.cancel')}
            </Button>
            <Button size="small" onClick={this.createWorksheet.bind(this)} color="primary">
              {i18n.t('common.create')}
            </Button>
          </DialogActions>
        </Dialog>
      </Drawer>
    );
  }
}

Sidebar.propTypes = {
  userId: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  worksheets: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  handleWorksheets: PropTypes.func.isRequired,
  handleSnackbar: PropTypes.func.isRequired,
  handleSidebar: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  history: PropTypes.object.isRequired, // eslint-disable-line
  location: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(Sidebar);
