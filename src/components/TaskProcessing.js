import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import { withStyles } from '@material-ui/core/styles';
import Favorite from '@material-ui/icons/Favorite';
import util from '../util';
import i18n from '../i18n';
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
        title = `${i18n.t(`worksheet.tableCtl.taskProcessing.${isOver ? 'over_target' : 'remaining_target'}`, { target: sec + i18n.t('common.sec') })} - ${title}`;
      } else if (isOver) {
        const min = actuallyMinute - processingTask.estimate;
        title = `${i18n.t('worksheet.tableCtl.taskProcessing.over_target', { target: min + i18n.t('common.min') })} - ${title}`;
      } else {
        const min = processingTask.estimate - actuallyMinute;
        title = actuallyMinute < 0 ? defaultTitle : `${i18n.t('worksheet.tableCtl.taskProcessing.remaining_target', { target: min + i18n.t('common.min') })} - ${title}`;
      }
    } else {
      title = `${actuallyMinute <= 0 ? `${moment(processingTask.now, 'HH:mm:ss').format('s') + i18n.t('common.sec')}` : `${actuallyMinute + i18n.t('common.min')}`}${i18n.t('worksheet.tableCtl.taskProcessing.passed')} - ${title}`;
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
      <div>
        <Favorite
          style={{
            fontSize: 15,
            marginRight: theme.spacing.unit,
            color: this.state.processingTask.id ? constants.brandColor.base.RED : constants.brandColor.base.GREY,
            animation: this.state.processingTask.id ? 'heartbeat 2s infinite' : '',
          }}
        />
        <div style={{ width: '90%', display: 'inline-block' }} title={this.state.processingTask.title}>
          <Typography variant="caption" align="center">
            {getTitle(this.state.processingTask, i18n.t('worksheet.tableCtl.taskProcessing.thereAreNoStartingTasks'), true)}
          </Typography>
          <LinearProgress
            classes={{ root: classes.progress, barColorPrimary: classes[color], colorPrimary: classes.grey }}
            variant="determinate"
            value={100 - remainPercent <= 0 ? 100 : 100 - remainPercent}
          />
        </div>
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
