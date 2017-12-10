import React from 'react';
import PropTypes from 'prop-types';
import Dialog, {
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';

function DescriptionDialog(props) {
  const { open, onRequestClose } = props;
  return (
    <Dialog
      open={open}
      onRequestClose={onRequestClose}
    >
      <DialogTitle>サイトについて</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {/* FIXME issue/56 */}
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}

DescriptionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
};

export default DescriptionDialog;
