import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';
import AssignmentReturn from '@material-ui/icons/AssignmentReturn';
import constants from '../constants';
import i18n from '../i18n';
import util from '../util';

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
      isOpenTooltip: false,
    };
  }

  handleWorksheetOpenRange(event) {
    if (!window.confirm(i18n.t('openRange.areYouSureSetOpenRangeTo_target', { target: event.target.value === constants.worksheetOpenRange.PUBLIC ? i18n.t('common.public') : i18n.t('common.private') }))) return;
    this.props.handleWorksheetOpenRange(event.target.value);
  }

  render() {
    const { worksheetOpenRange, classes } = this.props;
    return (
      <FormControl component="fieldset" required className={classes.formControl}>
        <Typography variant="subheading">
          {i18n.t('openRange.changeOpenRange')}
        </Typography>
        <RadioGroup
          aria-label="worksheetOpenRange"
          name="worksheetOpenRange"
          className={classes.group}
          value={worksheetOpenRange}
          onChange={this.handleWorksheetOpenRange.bind(this)}
        >
          <FormControlLabel
            value={constants.worksheetOpenRange.PUBLIC}
            control={<Radio color="primary" />}
            label={
              <span>{i18n.t('common.public')}: {i18n.t('openRange.anyoneCanRead')}</span>
          }
          />
          <FormControlLabel
            value={constants.worksheetOpenRange.PRIVATE}
            control={<Radio color="primary" />}
            label={
              <span>{i18n.t('common.private')}: {i18n.t('openRange.onlyMembersCanReadAndEdit')}</span>}
          />
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
              <Tooltip open={this.state.isOpenTooltip} onClose={() => { this.setState({ isOpenTooltip: false }); }} id="tooltip-copied" title={i18n.t('openRange.copied')}>
                <IconButton
                  aria-label="URL"
                  onClick={() => {
                    util.copyTextToClipboard(window.location.href);
                    this.setState({ isOpenTooltip: true });
                  }}
                  onMouseDown={(e) => { e.preventDefault(); }}
                >
                  <AssignmentReturn />
                </IconButton>
              </Tooltip>
            </InputAdornment>
              }
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

