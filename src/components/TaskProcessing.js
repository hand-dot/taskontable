import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import { withStyles } from '@material-ui/core/styles';
import Favorite from '@material-ui/icons/Favorite';
import util from '../util';
import tasksUtil from '../tasksUtil';
import constants from '../constants';
import openTaskSchema from '../schemas/openTaskSchema';


const styles = theme => ({
  progress: { height: theme.spacing.unit * 2 },
  blue: { background: constants.brandColor.base.BLUE },
  green: { background: constants.brandColor.base.GREEN },
  yellow: { background: constants.brandColor.base.YELLOW },
  red: { background: constants.brandColor.base.RED },
  grey: { background: constants.brandColor.base.GREY },
});

function getOpenTaskSchema() {
  return util.cloneDeep(openTaskSchema);
}

function getTitle(openTask, defaultTitle, isShortTitle) {
  const actuallyMinute = util.getTimeDiffMinute(openTask.startTime, openTask.now);
  let title = '';
  if (openTask.id) {
    title = isShortTitle ? `${(openTask.title.length < 18 ? openTask.title || '' : `${openTask.title.substring(0, 15)}...`) || '無名タスク'}` : openTask.title || '無名タスク';
    const isOver = actuallyMinute >= openTask.estimate;
    if (openTask.estimate - actuallyMinute === 1 || actuallyMinute - openTask.estimate === 0) {
      const sec = moment(openTask.now, 'HH:mm:ss').format('s');
      title = `${isOver ? `${sec}秒オーバー` : `残${60 - sec}秒`} - ${title}`;
    } else if (isOver) {
      title = `${`${actuallyMinute - openTask.estimate}分オーバー`} - ${title}`;
    } else {
      title = actuallyMinute < 0 ? defaultTitle : `残${openTask.estimate - actuallyMinute}分- ${title}`;
    }
  } else {
    title = defaultTitle;
  }
  return title;
}

class TaskProcessing extends Component {
  constructor(props) {
    super(props);
    this.bindOpenTaskIntervalID = '';
    this.oldTimeDiffMinute = '';
    this.state = {
      isMobile: util.isMobile(),
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
    if (this.state.isMobile) return;
    if (this.bindOpenTaskIntervalID) clearInterval(this.bindOpenTaskIntervalID);
    const openTask = tasksUtil.getSortedTasks(tasks).find(task => task.startTime && task.endTime === '' && task.estimate);
    if (util.isToday(this.props.date) && openTask) {
      this.bindOpenTaskIntervalID = setInterval(() => {
        const now = moment();
        const newTimeDiffMinute = util.getTimeDiffMinute(openTask.startTime, now.format(constants.TIMEFMT));
        if (newTimeDiffMinute >= 0) {
          openTask.now = now.format('HH:mm:ss');
          this.setState({ openTask: util.setIdIfNotExist(openTask) });
        } else if (!util.equal(this.state.openTask, openTaskSchema)) this.setState({ openTask: getOpenTaskSchema() });
        document.title = getTitle(openTask, constants.TITLE, false);
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
      if (remainPercent < 50) {
        color = 'green';
      } else if (remainPercent >= 50 && remainPercent < 75) {
        color = 'yellow';
      } else {
        color = 'red';
      }
    } else {
      color = 'grey';
    }
    return (
      <div style={{ paddingLeft: theme.spacing.unit * 2, paddingRight: theme.spacing.unit * 2 }} title={this.state.openTask.title}>
        <Typography variant="caption" align="center">
          <Favorite
            style={{
              fontSize: 10,
              marginRight: theme.spacing.unit,
              color: this.state.openTask.id ? constants.brandColor.base.RED : constants.brandColor.base.GREY,
              animation: this.state.openTask.id ? 'blink 1s infinite' : '',
            }}
          />
          {getTitle(this.state.openTask, '開始しているタスクはありません。', true)}
        </Typography>
        <LinearProgress
          classes={{ root: classes.progress, barColorPrimary: classes[color], colorPrimary: classes.grey }}
          variant="determinate"
          value={100 - remainPercent <= 0 ? 100 : 100 - remainPercent}
        />
      </div>
    );
  }
}

TaskProcessing.propTypes = {
  tableTasks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    assign: PropTypes.string.isRequired,
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
