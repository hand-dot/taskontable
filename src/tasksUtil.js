import moment from 'moment';
import * as R from 'ramda';
import constants from './constants';
import util from './util';

export default {
  /**
   * タスクの配列を受け取り見積時間の合計を取得します。
   * @param  {Array} tasks
   */
  getTotalEstimateMinute(tasks) {
    return R.compose(R.sum, R.map(R.prop('estimate'), R))(tasks);
  },
  /**
   * タスクの配列を受け取り実績の時間の合計を取得します。
   * @param  {Array} tasks
   */
  getTotalActuallyMinute(tasks) {
    return R.compose(R.sum, R.map(r => util.getTimeDiffMinute(r.startTime, r.endTime), R))(tasks);
  },
  /**
   * タスクの配列を受け取り見積のタイムラインチャートの生成に必要な配列にして返します。
   * @param  {Array} tasks
   */
  getEstimateTimelineChartTasks(tasks) {
    return tasks.filter(tableTask => tableTask.startTime).map((tableTask) => {
      const task = { key: '見積' };
      task.start = moment(tableTask.startTime, constants.TIMEFMT).toDate();
      task.end = moment(tableTask.startTime, constants.TIMEFMT).add(tableTask.estimate || 0, 'minutes').toDate();
      task.title = tableTask.title || '無名タスク';
      return task;
    })
    ;
  },
  /**
   * タスクの配列を受け取り実績のタイムラインチャートの生成に必要な配列にして返します。
   * @param  {Array} tasks
   */
  getActuallyTimelineChartTasks(tasks) {
    return tasks.filter(tableTask => tableTask.startTime && tableTask.endTime).map((tableTask) => {
      const task = { key: '実績' };
      task.start = moment(tableTask.startTime, constants.TIMEFMT).toDate();
      task.end = moment(tableTask.endTime, constants.TIMEFMT).toDate();
      task.title = tableTask.title || '無名タスク';
      return task;
    });
  },
  /**
   * タスクを開始時刻順に並び替えます。
   * 開始時刻が空の場合は後ろに行きます。
   * @param  {Array} tasks タスク
   */
  getSortedTasks(tasks) {
    const hasStartTimeTasks = [];
    const hasNotStartTimeTasks = [];
    for (let i = 0; i < tasks.length; i += 1) {
      const task = tasks[i];
      if (task.startTime !== '') {
        hasStartTimeTasks.push(task);
      } else {
        hasNotStartTimeTasks.push(task);
      }
    }
    return hasStartTimeTasks.sort((a, b) => {
      if (a.startTime > b.startTime) return 1;
      if (a.startTime < b.startTime) return -1;
      return 0;
    }).concat(hasNotStartTimeTasks);
  },
  /**
   * 引き数のオブジェクトから定期タスクとしての値を削除します。
   * 参考: poolTaskSchema
   * @param  {Object} obj オブジェクト
   */
  deleteRegularTaskProp(obj) {
    delete obj.dayOfWeek; // eslint-disable-line
    delete obj.week;  // eslint-disable-line
    return obj;
  },
};
