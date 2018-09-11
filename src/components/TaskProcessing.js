import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import { withStyles } from '@material-ui/core/styles';
import Favorite from '@material-ui/icons/Favorite';
import util from '../utils/util';
import i18n from '../i18n';
import tasksUtil from '../utils/tasksUtil';
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
    title = isShortTitle ? `${(processingTask.title.length < 18 ? processingTask.title
      || '' : `${processingTask.title.substring(0, 15)}...`)
      || i18n.t('common.anonymousTask')}` : processingTask.title
      || i18n.t('common.anonymousTask');
    if (processingTask.estimate) {
      const isOver = actuallyMinute >= processingTask.estimate;
      if (processingTask.estimate - actuallyMinute === 1
         || actuallyMinute - processingTask.estimate === 0) {
        const sec = moment(processingTask.now, 'HH:mm:ss').format('s');
        title = `${i18n.t(`worksheet.tableCtl.taskProcessing.${isOver ? 'over_target' : 'remaining_target'}`, { target: (isOver ? sec : 60 - sec) + i18n.t('common.sec') })} - ${title}`;
      } else if (isOver) {
        const min = actuallyMinute - processingTask.estimate;
        title = `${i18n.t('worksheet.tableCtl.taskProcessing.over_target', { target: min + i18n.t('common.min') })} - ${title}`;
      } else {
        const min = processingTask.estimate - actuallyMinute;
        title = actuallyMinute < 0 ? defaultTitle : `${i18n.t('worksheet.tableCtl.taskProcessing.remaining_target', { target: min + i18n.t('common.min') })} - ${title}`;
      }
    } else {
      title = `${actuallyMinute <= 0 ? `${moment(processingTask.now, 'HH:mm:ss').format('s') + i18n.t('common.sec')}` : `${actuallyMinute + i18n.t('common.min')}`} ${i18n.t('worksheet.tableCtl.taskProcessing.passed')} - ${title}`;
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
   * 開始しているタスクを見つけ、stateに反映します。
   * @param  {Array} tasks タスクの配列
   */
  bindProcessingTaskProcessing(tasks) {
    const { isMobile } = this.state;
    const { date } = this.props;
    if (isMobile) return;
    if (this.bindProcessingTaskIntervalID) clearInterval(this.bindProcessingTaskIntervalID);
    const prcesTask = tasksUtil.getSortedTasks(tasks).find(task => task.startTime && task.endTime === '');
    if (util.isToday(date) && prcesTask) {
      this.bindprcesTaskIntervalID = setInterval(() => {
        const now = moment();
        const newTimeDiffMinute = util.getTimeDiffMinute(prcesTask.startTime,
          now.format(constants.TIMEFMT));
        if (newTimeDiffMinute >= 0) {
          prcesTask.now = now.format('HH:mm:ss');
          this.setState({ processingTask: util.setIdIfNotExist(prcesTask) });
        } else if (!util.equal(prcesTask, getProcessingTaskSchema)) {
          this.setState({ processingTask: getProcessingTaskSchema() });
        }
        this.oldTimeDiffMinute = newTimeDiffMinute;
      }, 1000);
    } else {
      this.bindProcessingTaskIntervalID = '';
      document.title = constants.TITLE;
      if (!util.equal(prcesTask, processingTaskSchema)) {
        this.setState({ processingTask: getProcessingTaskSchema() });
      }
    }
  }

  render() {
    const { processingTask } = this.state;
    const { classes, theme } = this.props;
    document.title = getTitle(processingTask, constants.TITLE, false);
    let remainPercent = 0;
    let color = '';
    if (processingTask.id) {
      if (processingTask.estimate) {
        remainPercent = Math.floor(util.getTimeDiffSec(`${processingTask.startTime}:00`, processingTask.now) * (100 / (processingTask.estimate * 60)));
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
            color: processingTask.id
              ? constants.brandColor.base.RED : constants.brandColor.base.GREY,
            animation: processingTask.id ? 'heartbeat 2s infinite' : '',
          }}
        />
        <div style={{ width: '90%', display: 'inline-block' }} title={processingTask.title}>
          <Typography variant="caption" align="center">
            {getTitle(processingTask, i18n.t('worksheet.tableCtl.taskProcessing.thereAreNoStartingTasks'), true)}
          </Typography>
          <LinearProgress
            classes={{
              root: classes.progress,
              barColorPrimary: classes[color],
              colorPrimary: classes.grey,
            }}
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
