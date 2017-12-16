import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Dialog, {
  DialogContent,
  DialogTitle,
} from 'material-ui/Dialog';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';

const styles = {
  appBar: {
    position: 'relative',
  },
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
};

function DescriptionDialog(props) {
  const { open, onRequestClose, classes } = props;
  return (
    <Dialog
      fullScreen
      open={open}
      onRequestClose={onRequestClose}
    >
      <AppBar color="default" className={classes.appBar}>
        <Toolbar>
          <Typography type="title" color="inherit" className={classes.flex}>
            <i className="fa fa-question" aria-hidden="true" />
            　サービスについて
          </Typography>
          <IconButton className={classes.closeBtn} onClick={onRequestClose}>
            <i className="fa fa-times" aria-hidden="true" />
          </IconButton>
        </Toolbar>
      </AppBar>
      <DialogTitle>タイトル</DialogTitle>
      <DialogContent className={classes.content}>
        <Grid container spacing={40}>
          <Grid item xs={12}>
            <Typography gutterBottom>
              現在作成中です
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

DescriptionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DescriptionDialog);
