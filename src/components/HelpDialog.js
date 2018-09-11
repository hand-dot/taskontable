import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Close from '@material-ui/icons/Close';

import '../styles/helpdialog.css';
import constants from '../constants';
import util from '../utils/util';
import i18n from '../i18n';

const styles = {
  flex: {
    flex: 1,
  },
  closeBtn: {
    marginLeft: 'auto',
    marginRight: 20,
  },
  content: {
    flex: 'initial',
  },
  block: {
    fontSize: 22,
    margin: 5,
  },
};

const tableColors = [
  { tableColor: 'yellow', cellColor: 'WARNING' },
  { tableColor: 'green', cellColor: 'RESERVATION' },
  { tableColor: 'blue', cellColor: 'RUNNING' },
  { tableColor: 'red', cellColor: 'OUT' },
];

const keyboardShortcuts = {
  application: [
    { keys: ['ctrl', '?'], label: 'showHelp' },
    { keys: [constants.METAKEY, 'S'], label: 'save' },
    { keys: [constants.METAKEY, 'J'], label: 'dashboardOpenAndClose' },
    { keys: [constants.METAKEY, '>'], label: 'moveToNextDay' },
    { keys: [constants.METAKEY, '<'], label: 'moveToPreviousDay' },
    { keys: [constants.METAKEY, ']'], label: 'moveToNextTab' },
    { keys: [constants.METAKEY, '['], label: 'moveToPreviousTab' },
  ],
  table: [
    { keys: [constants.METAKEY, 'C'], label: 'copy' },
    { keys: [constants.METAKEY, 'X'], label: 'cut' },
    { keys: [constants.METAKEY, 'V'], label: 'paste' },
    { keys: [constants.METAKEY, 'Z'], label: 'back' },
    { keys: [constants.METAKEY, 'Y'], label: 'forward' },
    { keys: [constants.METAKEY, ':'], label: 'enterCurrentTime' },
  ],
};

function HelpDialog(props) {
  const {
    open, onClose, classes, theme,
  } = props;
  return (
    <Dialog
      fullScreen={util.isMobile()}
      open={open}
      onClose={onClose}
    >
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography variant="title" color="inherit" className={classes.flex}>
            {i18n.t('help.title')}
          </Typography>
          <IconButton className={classes.closeBtn} onClick={onClose}>
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>
      <div>
        <DialogTitle>
          {i18n.t('help.tableColor')}
        </DialogTitle>
        <DialogContent className={classes.content}>
          <Grid container>
            <Grid item xs={12}>
              {tableColors.map(_ => (
                <Typography key={_.tableColor} gutterBottom variant="caption">
                  {i18n.t(`help.tableColors.${_.tableColor}`)}
                  {' '}
                  /
                  <span className={classes.block} style={{ color: constants.cellColor[_.cellColor] }}>
                  ■
                  </span>
                </Typography>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
      </div>
      {!util.isMobile() && (
        <div>
          <DialogTitle>
            {i18n.t('help.keyboardShortcut')}
          </DialogTitle>
          <DialogContent className={classes.content}>
            <Grid container>
              <Grid className={classes.shotcut} item xs={6}>
                <h5 style={{ margin: theme.spacing.unit }}>
                  {i18n.t('help.keyboardShortcuts.application')}
                </h5>
                {/* ヘルプだけはmacOSでクロームのヘルプがアプリのレベルで割り当てられていてctrlにしなければいけない */}
                {keyboardShortcuts.application.map(_ => (
                  <Typography key={_.label} gutterBottom variant="caption">
                    {_.keys.map((key, index) => (
                      <span key={key}>
                        {index !== 0 && ' + '}
                        <kbd>
                          {key}
                        </kbd>
                      </span>
                    ))}
                    {' '}
                      –
                    {' '}
                    {i18n.t(`help.keyboardShortcuts.${_.label}`)}
                  </Typography>
                ))}
              </Grid>
              <Grid className={classes.shotcut} item xs={6}>
                <h5 style={{ margin: theme.spacing.unit }}>
                  {i18n.t('help.keyboardShortcuts.table')}
                </h5>
                <Typography gutterBottom variant="caption">
                  <kbd>
                    {i18n.t('help.keyboardShortcuts.rightClick')}
                  </kbd>
                  {' '}
                    –
                  {' '}
                  {i18n.t('help.keyboardShortcuts.showContextMenu')}
                </Typography>
                {keyboardShortcuts.table.map(_ => (
                  <Typography key={_.label} gutterBottom variant="caption">
                    {_.keys.map((key, index) => (
                      <span key={key}>
                        {index !== 0 && ' + '}
                        <kbd>
                          {key}
                        </kbd>
                      </span>
                    ))}
                    {' '}
                      –
                    {' '}
                    {i18n.t(`help.keyboardShortcuts.${_.label}`)}
                  </Typography>
                ))}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogTitle>
            {i18n.t('help.aboutTaskInput')}
          </DialogTitle>
          <DialogContent className={classes.content}>
            <Grid container>
              <Grid item xs={12}>
                <Typography gutterBottom variant="caption">
                  {i18n.t('help.rightClickOnTheCell')}
                </Typography>
                <Typography gutterBottom variant="caption">
                  {i18n.t('help.rowDragAndDrop')}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogTitle>
            {i18n.t('help.aboutNotification')}
          </DialogTitle>
          <DialogContent className={classes.content}>
            <Grid container>
              <Grid item xs={12}>
                <Typography gutterBottom variant="caption">
                  {i18n.t('help.toReserveStartNotification')}
                </Typography>
                <Typography gutterBottom variant="caption">
                  {i18n.t('help.toReserveEndNotification')}
                </Typography>
                <Typography gutterBottom variant="caption">
                  {i18n.t('help.notificationNotDisplayed')}
                  <a href={constants.CHROME_HELP_PERMISSION_URL} target="_blank" rel="noreferrer noopener">
                    {i18n.t('help.changeGoogleChromeSitePermissions')}
                  </a>
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
        </div>
      )}
    </Dialog>
  );
}

HelpDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(HelpDialog);
