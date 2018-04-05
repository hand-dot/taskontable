import moment from 'moment';
import * as R from 'ramda';
import constants from './constants';
import util from './util';

export default {

  totalEstimateMinute(datas) {
    return R.compose(R.sum, R.map(R.prop('estimate'), R))(datas);
  },
  totalActuallyMinute(datas) {
    return datas.map(data => util.getTimeDiffMinute(data.startTime, data.endTime)).reduce((p, c) => p + c, 0);
  },
  getEstimateTimelineChartTasks(tableTasks) {
    return tableTasks.filter(tableTask => tableTask.startTime).map((tableTask) => {
      const task = { key: '見積' };
      task.start = moment(tableTask.startTime, constants.TIMEFMT).toDate();
      task.end = moment(tableTask.startTime, constants.TIMEFMT).add(tableTask.estimate || 0, 'minutes').toDate();
      task.title = tableTask.title || '無名タスク';
      return task;
    })
    ;
  },
  getActuallyTimelineChartTasks(tableTasks) {
    return tableTasks.filter(tableTask => tableTask.startTime && tableTask.endTime).map((tableTask) => {
      const task = { key: '実績' };
      task.start = moment(tableTask.startTime, constants.TIMEFMT).toDate();
      task.end = moment(tableTask.endTime, constants.TIMEFMT).toDate();
      task.title = tableTask.title || '無名タスク';
      return task;
    });
  },

};
