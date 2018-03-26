import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Typography from 'material-ui/Typography';
import { LinearProgress } from 'material-ui/Progress';
import { withStyles } from 'material-ui/styles';
import util from '../util';
import constants from '../constants';
import openTaskSchema from '../schemas/openTaskSchema';


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

function getOpenTaskSchema() {
  return util.cloneDeep(openTaskSchema);
}

class TaskProcessing extends Component {
  constructor(props) {
    super(props);
    this.bindOpenTaskIntervalID = '';
    this.oldTimeDiffMinute = '';
    this.state = {
      isHotMode: this.props.theme.breakpoints.values.sm < constants.APPWIDTH,
      openTask: getOpenTaskSchema(),
    };
  }

  componentWillReceiveProps(nextProps) {
    this.bindOpenTaskProcessing(nextProps.tableTasks);
  }

  componentWillUnmount() {
    if (this.bindOpenTaskIntervalID) clearInterval(this.bindOpenTaskIntervalID);
    document.title = constants.TITLE;
  }

  /**
   * 開始しているタスクを見つけ、経過時間をタイトルに反映する
   * @param  {Array} tasks タスクの配列
   */
  bindOpenTaskProcessing(tasks) {
    if (!this.state.isHotMode) return;
    if (this.bindOpenTaskIntervalID) clearInterval(this.bindOpenTaskIntervalID);
    const openTask = util.cloneDeep(tasks.find(task => task.startTime && task.endTime === '' && task.estimate));
    if (util.isToday(this.props.date) && openTask) {
      this.bindOpenTaskIntervalID = setInterval(() => {
        const now = moment();
        const newTimeDiffMinute = util.getTimeDiffMinute(openTask.startTime, now.format(constants.TIMEFMT));
        if (newTimeDiffMinute >= 0) {
          openTask.now = now.format('HH:mm:ss');
          this.setState({ openTask: util.setIdIfNotExist(openTask) });
          document.title = `${newTimeDiffMinute === 0 ? `${now.format('ss')}秒` : `${newTimeDiffMinute}分経過`} - ${openTask.title || '無名タスク'}`;
        } else {
          document.title = constants.TITLE;
          if (!util.equal(this.state.openTask, openTaskSchema)) this.setState({ openTask: getOpenTaskSchema() });
        }
        this.oldTimeDiffMinute = newTimeDiffMinute;
      }, 1000);
    } else {
      this.bindOpenTaskIntervalID = '';
      document.title = constants.TITLE;
      if (!util.equal(this.state.openTask, openTaskSchema)) this.setState({ openTask: getOpenTaskSchema() });
    }
  }

  render() {
    const { classes, theme } = this.props;
    let remainPercent = 0;
    let color = '';
    if (this.state.openTask.id) {
      remainPercent = Math.floor(util.getTimeDiffSec(`${this.state.openTask.startTime}:00`, this.state.openTask.now) * (100 / (this.state.openTask.estimate * 60)));
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
    const actuallyMinute = util.getTimeDiffMinute(this.state.openTask.startTime, this.state.openTask.now);
    let title = '';
    let detail = '';
    if (this.state.openTask.id) {
      title = `${(this.state.openTask.title.length < 20 ? this.state.openTask.title || '' : `${this.state.openTask.title.substring(0, 17)}...`) || '無名タスク'}`;
      const isOver = actuallyMinute >= this.state.openTask.estimate;
      if (this.state.openTask.estimate - actuallyMinute === 1 || actuallyMinute - this.state.openTask.estimate === 0) {
        const sec = moment(this.state.openTask.now, 'HH:mm:ss').format('ss');
        detail = ` - ${isOver ? `${sec}秒オーバー` : `残${60 - sec}秒`}`;
      } else {
        detail = ` - ${isOver ? `${actuallyMinute - this.state.openTask.estimate}分オーバー` : `残${this.state.openTask.estimate - actuallyMinute}分`}`;
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
              color: this.state.openTask.id ? constants.brandColor.base.RED : constants.brandColor.base.GREY,
              animation: this.state.openTask.id ? 'blink 1s infinite' : '',
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
  tableTasks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    estimate: PropTypes.any.isRequired,
    endTime: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    memo: PropTypes.string.isRequired,
  })).isRequired,
  date: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(TaskProcessing);

