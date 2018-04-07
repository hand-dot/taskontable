import moment from 'moment';
import * as R from 'ramda';
import constants from './constants';
import util from './util';
import tableTaskSchema from './schemas/tableTaskSchema';

export default {
  /**
   * 開始時刻と終了時刻の入力された終了したタスクを取得します。
   * @param  {Array} tasks
   */
  getDoneTasks(tasks) {
    const doneTask = t => t.startTime && t.endTime;
    return R.compose(R.filter(doneTask, R))(tasks);
  },
  /**
   * 開始時刻or終了時刻の入力されていないタスクを取得します。
   * @param  {Array} tasks
   */
  getOpenTasks(tasks) {
    const doneTask = t => !t.startTime || !t.endTime;
    return R.compose(R.filter(doneTask, R))(tasks);
  },
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
    const hasStartTime = t => t.startTime;
    const getTimelineChartTask = t => ({ key: '見積', start: moment(t.startTime, constants.TIMEFMT).toDate(), end: moment(t.startTime, constants.TIMEFMT).add(t.estimate || 0, 'minutes').toDate(), title: t.title || '無名タスク' });
    return R.compose(R.map(r => getTimelineChartTask(r)), R.filter(hasStartTime, R))(tasks);
  },
  /**
   * タスクの配列を受け取り実績のタイムラインチャートの生成に必要な配列にして返します。
   * @param  {Array} tasks
   */
  getActuallyTimelineChartTasks(tasks) {
    const getTimelineChartTask = t => ({ key: '実績', start: moment(t.startTime, constants.TIMEFMT).toDate(), end: moment(t.endTime, constants.TIMEFMT).toDate(), title: t.title || '無名タスク' });
    return R.compose(R.map(r => getTimelineChartTask(r)), this.getDoneTasks(R))(tasks);
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
   * 引き数のオブジェクトからtableTaskSchemaのプロパティのみにして返します。
   * 参考: poolTaskSchema
   * @param  {Object} task タスク
   */
  deleteUselessTaskProp(task) {
    const obj = {};
    Object.keys(tableTaskSchema).forEach((prop) => {
      obj[prop] = task[prop];
    });
    return obj;
  },
};
