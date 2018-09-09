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
              <Typography gutterBottom variant="caption">
                {i18n.t('help.tableColors.yellow')}
                {' '}
/
                <span className={classes.block} style={{ color: constants.cellColor.WARNING }}>
■
                </span>
              </Typography>
              <Typography gutterBottom variant="caption">
                {i18n.t('help.tableColors.green')}
                {' '}
/
                <span className={classes.block} style={{ color: constants.cellColor.RESERVATION }}>
■
                </span>
              </Typography>
              <Typography gutterBottom variant="caption">
                {i18n.t('help.tableColors.blue')}
                {' '}
/
                <span className={classes.block} style={{ color: constants.cellColor.RUNNING }}>
■
                </span>
              </Typography>
              <Typography gutterBottom variant="caption">
                {i18n.t('help.tableColors.red')}
                {' '}
/
                <span className={classes.block} style={{ color: constants.cellColor.OUT }}>
■
                </span>
              </Typography>
              <Typography gutterBottom variant="caption">
                {i18n.t('help.tableColors.gray')}
                {' '}
/
                <span className={classes.block} style={{ color: constants.cellColor.DONE }}>
■
                </span>
              </Typography>
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
                <Typography gutterBottom variant="caption">
                  <kbd>
ctrl
                  </kbd>
                  {' '}
+
                  {' '}
                  <kbd>
?
                  </kbd>
                  {' '}
–
                  {' '}
                  {i18n.t('help.keyboardShortcuts.showHelp')}
                </Typography>
                <Typography gutterBottom variant="caption">
                  <kbd>
                    {constants.METAKEY}
                  </kbd>
                  {' '}
+
                  {' '}
                  <kbd>
S
                  </kbd>
                  {' '}
–
                  {' '}
                  {i18n.t('help.keyboardShortcuts.save')}
                </Typography>
                <Typography gutterBottom variant="caption">
                  <kbd>
                    {constants.METAKEY}
                  </kbd>
                  {' '}
+
                  {' '}
                  <kbd>
J
                  </kbd>
                  {' '}
–
                  {' '}
                  {i18n.t('help.keyboardShortcuts.dashboardOpenAndClose')}
                </Typography>
                <Typography gutterBottom variant="caption">
                  <kbd>
                    {constants.METAKEY}
                  </kbd>
                  {' '}
+
                  {' '}
                  <kbd>
&gt;
                  </kbd>
                  {' '}
–
                  {' '}
                  {i18n.t('help.keyboardShortcuts.moveToNextDay')}
                </Typography>
                <Typography gutterBottom variant="caption">
                  <kbd>
                    {constants.METAKEY}
                  </kbd>
                  {' '}
+
                  {' '}
                  <kbd>
&lt;
                  </kbd>
                  {' '}
–
                  {' '}
                  {i18n.t('help.keyboardShortcuts.moveToPreviousDay')}
                </Typography>
                <Typography gutterBottom variant="caption">
                  <kbd>
                    {constants.METAKEY}
                  </kbd>
                  {' '}
+
                  {' '}
                  <kbd>
]
                  </kbd>
                  {' '}
–
                  {' '}
                  {i18n.t('help.keyboardShortcuts.moveToNextTab')}
                </Typography>
                <Typography gutterBottom variant="caption">
                  <kbd>
                    {constants.METAKEY}
                  </kbd>
                  {' '}
+
                  {' '}
                  <kbd>
[
                  </kbd>
                  {' '}
–
                  {' '}
                  {i18n.t('help.keyboardShortcuts.moveToPreviousTab')}
                </Typography>
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
                <Typography gutterBottom variant="caption">
                  <kbd>
                    {constants.METAKEY}
                  </kbd>
                  {' '}
+
                  {' '}
                  <kbd>
C
                  </kbd>
                  {' '}
–
                  {' '}
                  {i18n.t('help.keyboardShortcuts.copy')}
                </Typography>
                <Typography gutterBottom variant="caption">
                  <kbd>
                    {constants.METAKEY}
                  </kbd>
                  {' '}
+
                  {' '}
                  <kbd>
X
                  </kbd>
                  {' '}
–
                  {' '}
                  {i18n.t('help.keyboardShortcuts.cut')}
                </Typography>
                <Typography gutterBottom variant="caption">
                  <kbd>
                    {constants.METAKEY}
                  </kbd>
                  {' '}
+
                  {' '}
                  <kbd>
V
                  </kbd>
                  {' '}
–
                  {' '}
                  {i18n.t('help.keyboardShortcuts.paste')}
                </Typography>
                <Typography gutterBottom variant="caption">
                  <kbd>
                    {constants.METAKEY}
                  </kbd>
                  {' '}
+
                  {' '}
                  <kbd>
Z
                  </kbd>
                  {' '}
–
                  {' '}
                  {i18n.t('help.keyboardShortcuts.back')}
                </Typography>
                <Typography gutterBottom variant="caption">
                  <kbd>
                    {constants.METAKEY}
                  </kbd>
                  {' '}
+
                  {' '}
                  <kbd>
Y
                  </kbd>
                  {' '}
–
                  {' '}
                  {i18n.t('help.keyboardShortcuts.forward')}
                </Typography>
                <Typography gutterBottom variant="caption">
                  <kbd>
                    {constants.METAKEY}
                  </kbd>
                  {' '}
+
                  {' '}
                  <kbd>
:
                  </kbd>
                  {' '}
–
                  {' '}
                  {i18n.t('help.keyboardShortcuts.enterCurrentTime')}
                </Typography>
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
                  <a href={constants.CHROME_HELP_PERMISSION_URL} target="_blank">
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
