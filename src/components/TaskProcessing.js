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
import processingTaskSchema from '../schemas/processingTaskSchema';


const styles = theme => ({
  progress: { height: theme.spacing.unit * 2 },
  blue: { background: constants.brandColor.base.BLUE },
  green: { background: constants.brandColor.base.GREEN },
  yellow: { background: constants.brandColor.base.YELLOW },
  red: { background: constants.brandColor.base.RED },
  grey: { background: constants.brandColor.base.GREY },
});

function getProcessingTaskSchema() {
  return util.cloneDeep(processingTaskSchema);
}

function getTitle(processingTask, defaultTitle, isShortTitle) {
  const actuallyMinute = util.getTimeDiffMinute(processingTask.startTime, processingTask.now);
  let title = '';
  if (processingTask.id) {
    title = isShortTitle ? `${(processingTask.title.length < 18 ? processingTask.title || '' : `${processingTask.title.substring(0, 15)}...`) || '無名タスク'}` : processingTask.title || '無名タスク';
    if (processingTask.estimate) {
      const isOver = actuallyMinute >= processingTask.estimate;
      if (processingTask.estimate - actuallyMinute === 1 || actuallyMinute - processingTask.estimate === 0) {
        const sec = moment(processingTask.now, 'HH:mm:ss').format('s');
        title = `${isOver ? `${sec}秒オーバー` : `残${60 - sec}秒`} - ${title}`;
      } else if (isOver) {
        title = `${`${actuallyMinute - processingTask.estimate}分オーバー`} - ${title}`;
      } else {
        title = actuallyMinute < 0 ? defaultTitle : `残${processingTask.estimate - actuallyMinute}分- ${title}`;
      }
    } else {
      title = `${actuallyMinute <= 0 ? `${moment(processingTask.now, 'HH:mm:ss').format('s')}秒` : `${actuallyMinute}分`}経過 - ${title}`;
    }
  } else {
    title = defaultTitle;
  }
  return title;
}

class TaskProcessing extends Component {
  constructor(props) {
    super(props);
    this.bindProcessingTaskIntervalID = '';
    this.oldTimeDiffMinute = '';
    this.state = {
      isMobile: util.isMobile(),
      processingTask: getProcessingTaskSchema(),
    };
  }

  componentWillReceiveProps(nextProps) {
    this.bindProcessingTaskProcessing(nextProps.tableTasks);
  }

  componentWillUnmount() {
    if (this.bindProcessingTaskIntervalID) clearInterval(this.bindProcessingTaskIntervalID);
    document.title = constants.TITLE;
  }

  /**
   * 開始しているタスクを見つけ、経過時間をタイトルに反映する
   * @param  {Array} tasks タスクの配列
   */
  bindProcessingTaskProcessing(tasks) {
    if (this.state.isMobile) return;
    if (this.bindProcessingTaskIntervalID) clearInterval(this.bindProcessingTaskIntervalID);
    const processingTask = tasksUtil.getSortedTasks(tasks).find(task => task.startTime && task.endTime === '');
    if (util.isToday(this.props.date) && processingTask) {
      this.bindProcessingTaskIntervalID = setInterval(() => {
        const now = moment();
        const newTimeDiffMinute = util.getTimeDiffMinute(processingTask.startTime, now.format(constants.TIMEFMT));
        if (newTimeDiffMinute >= 0) {
          processingTask.now = now.format('HH:mm:ss');
          this.setState({ processingTask: util.setIdIfNotExist(processingTask) });
        } else if (!util.equal(this.state.processingTask, getProcessingTaskSchema)) {
          this.setState({ processingTask: getProcessingTaskSchema() });
        }
        document.title = getTitle(processingTask, constants.TITLE, false);
        this.oldTimeDiffMinute = newTimeDiffMinute;
      }, 1000);
    } else {
      this.bindProcessingTaskIntervalID = '';
      document.title = constants.TITLE;
      if (!util.equal(this.state.processingTask, processingTaskSchema)) this.setState({ processingTask: getProcessingTaskSchema() });
    }
  }

  render() {
    const { classes, theme } = this.props;
    let remainPercent = 0;
    let color = '';
    if (this.state.processingTask.id) {
      if (this.state.processingTask.estimate) {
        remainPercent = Math.floor(util.getTimeDiffSec(`${this.state.processingTask.startTime}:00`, this.state.processingTask.now) * (100 / (this.state.processingTask.estimate * 60)));
        if (remainPercent < 50) {
          color = 'green';
        } else if (remainPercent >= 50 && remainPercent < 75) {
          color = 'yellow';
        } else {
          color = 'red';
        }
      } else {
        color = 'yellow';
      }
    } else {
      color = 'grey';
    }
    return (
      <div style={{ paddingLeft: theme.spacing.unit * 2, paddingRight: theme.spacing.unit * 2 }} title={this.state.processingTask.title}>
        <Typography variant="caption" align="center">
          <Favorite
            style={{
              fontSize: 10,
              marginRight: theme.spacing.unit,
              color: this.state.processingTask.id ? constants.brandColor.base.RED : constants.brandColor.base.GREY,
              animation: this.state.processingTask.id ? 'blink 1s infinite' : '',
            }}
          />
          {getTitle(this.state.processingTask, '開始しているタスクはありません。', true)}
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
