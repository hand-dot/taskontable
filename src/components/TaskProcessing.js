import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Typography from 'material-ui/Typography';
import { LinearProgress } from 'material-ui/Progress';
import { withStyles } from 'material-ui/styles';
import util from '../util';
import constants from '../constants';

const styles = {
  blue: {
    background: constants.brandColor.base.BLUE,
  },
  yellow: {
    background: constants.brandColor.base.YELLOW,
  },
  red: {
    background: constants.brandColor.base.RED,
  },
  grey: {
    background: constants.brandColor.base.GREY,
  },
};

class TaskProcessing extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {
    const { openTask, classes, theme } = this.props;
    let remainPercent = 0;
    let color = '';
    if (openTask.id) {
      remainPercent = Math.floor(util.getTimeDiffSec(`${openTask.startTime}:00`, openTask.now) * (100 / (openTask.estimate * 60)));
      if (remainPercent < 70) {
        color = 'blue';
      } else if (remainPercent >= 70 && remainPercent < 95) {
        color = 'yellow';
      } else {
        color = 'red';
      }
    } else {
      color = 'grey';
    }
    const actuallyMinute = util.getTimeDiffMinute(openTask.startTime, openTask.now);
    let title = '';
    let detail = '';
    if (openTask.id) {
      title = `${(openTask.title.length < 20 ? openTask.title || '' : `${openTask.title.substring(0, 17)}...`) || '無名タスク'}`;
      const isOver = actuallyMinute >= openTask.estimate;
      if (openTask.estimate - actuallyMinute === 1 || actuallyMinute - openTask.estimate === 0) {
        const sec = moment(openTask.now, 'HH:mm:ss').format('ss');
        detail = ` - ${isOver ? `${sec}秒オーバー` : `残${60 - sec}秒`}`;
      } else {
        detail = ` - ${isOver ? `${actuallyMinute - openTask.estimate}分オーバー` : `残${openTask.estimate - actuallyMinute}分`}`;
      }
    } else {
      title = '開始しているタスクはありません。';
    }
    return (
      <div style={{ paddingLeft: theme.spacing.unit, paddingRight: theme.spacing.unit }}>
        <LinearProgress
          style={{ marginBottom: theme.spacing.unit }}
          classes={{ barColorPrimary: classes[color], colorPrimary: classes.grey }}
          variant="determinate"
          value={100 - remainPercent <= 0 ? 100 : 100 - remainPercent}
        />
        <Typography variant="caption" align="center">
          <span
            style={{
              marginRight: theme.spacing.unit,
              color: openTask.id ? constants.brandColor.base.RED : constants.brandColor.base.GREY,
              animation: openTask.id ? 'blink 1s infinite' : '',
            }}
            variant="caption"
          >[●REC]</span>
          {`${title}${detail}`}
        </Typography>
      </div>
    );
  }
}

TaskProcessing.propTypes = {

  openTask: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    estimate: PropTypes.any.isRequired,
    endTime: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    memo: PropTypes.string.isRequired,
    now: PropTypes.string.isRequired,
  }).isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(TaskProcessing);

