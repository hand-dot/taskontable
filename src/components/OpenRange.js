import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';
import AssignmentReturn from '@material-ui/icons/AssignmentReturn';
import constants from '../constants';

const styles = theme => ({
  root: {
    display: 'flex',
  },
  formControl: {
    margin: theme.spacing.unit * 3,
  },
  group: {
    margin: `${theme.spacing.unit}px 0`,
  },
});

class OpenRange extends Component {
  constructor(props) {
    super(props);
    this.state = {
      snackbarText: '',
      isOpenSnackbar: false,
    };
  }

  handleWorksheetOpenRange(event) {
    if (!window.confirm(`公開範囲を${event.target.value === constants.worksheetOpenRange.PUBLIC ? '公開' : '非公開'}に設定してもよろしいですか？`)) return;
    this.props.handleWorksheetOpenRange(event.target.value);
  }

  render() {
    const { worksheetOpenRange, classes } = this.props;
    return (
      <FormControl component="fieldset" required className={classes.formControl}>
        <Typography variant="subheading">
              公開範囲を変更
        </Typography>
        <RadioGroup
          aria-label="worksheetOpenRange"
          name="worksheetOpenRange"
          className={classes.group}
          value={worksheetOpenRange}
          onChange={this.handleWorksheetOpenRange.bind(this)}
        >
          <FormControlLabel value={constants.worksheetOpenRange.PUBLIC} control={<Radio color="primary" />} label={<span>公開: URLを知っている人は誰でも閲覧でき、Googleのような検索エンジンにも表示されます。編集可能なのはワークシートのメンバーのみです。</span>} />
          <FormControlLabel value={constants.worksheetOpenRange.PRIVATE} control={<Radio color="primary" />} label={<span>非公開: ワークシートのメンバーのみ、閲覧、編集できます。</span>} />
        </RadioGroup>
        <Typography variant="subheading">
              URL
        </Typography>
        <Input
          id="urlInput"
          type="text"
          value={window.location.href}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="URL"
                onClick={() => {
                    const target = document.getElementById('urlInput');
                    const range = document.createRange();
                    range.selectNode(target);
                    window.getSelection().addRange(range);
                    document.execCommand('copy');
                    this.setState({ isOpenSnackbar: true, snackbarText: 'クリップボードにURLをコピーしました。' });
                }}
                onMouseDown={(e) => { e.preventDefault(); }}
              >
                <AssignmentReturn />
              </IconButton>
            </InputAdornment>
              }
        />
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={this.state.isOpenSnackbar}
          onClose={() => { this.setState({ isOpenSnackbar: false, snackbarText: '' }); }}
          message={this.state.snackbarText}
        />
      </FormControl>
    );
  }
}

OpenRange.propTypes = {
  worksheetOpenRange: PropTypes.string.isRequired,
  handleWorksheetOpenRange: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};
export default withStyles(styles, { withTheme: true })(OpenRange);

