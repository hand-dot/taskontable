import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Dialog, {
  DialogContent,
  DialogContentText,
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
};

function DescriptionDialog(props) {
  const { open, onRequestClose, classes } = props;
  return (
    <Dialog
      fullScreen
      open={open}
      onRequestClose={onRequestClose}
    >
      <AppBar className={classes.appBar}>
        <Toolbar>
          <Typography type="title" color="inherit" className={classes.flex}>
            サイトについて
          </Typography>
          <IconButton className={classes.closeBtn} color="contrast" onClick={onRequestClose}>
            <i className="fa fa-times" aria-hidden="true" />
          </IconButton>
        </Toolbar>
      </AppBar>
      <DialogTitle>タイトル</DialogTitle>
      <DialogContent>
        <Grid container spacing={40}>
          <Grid item xs={6}>
            <Typography gutterBottom>
              テキスト
            </Typography>
            <Typography gutterBottom>
              テキスト
            </Typography>
            <Typography gutterBottom>
              テキスト
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography gutterBottom>
              テキスト
            </Typography>
            <Typography gutterBottom>
              テキスト
            </Typography>
            <Typography gutterBottom>
              テキスト
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
