import chai from 'chai';
import moment from 'moment';
import exampleTaskData from '../exampleDatas/exampleTaskData';
import tasksUtil from '../tasksUtil';
import util from '../util';
import constants from '../constants';

const assert = chai.assert;
it('getDoneTasks - exampleTaskDataで完了したタスクは4つであること', () => {
  assert.equal(tasksUtil.getDoneTasks(exampleTaskData).length, 4);
});
it('getOpenTasks - exampleTaskDataで完了したタスクは4つであること', () => {
  assert.equal(tasksUtil.getOpenTasks(exampleTaskData).length, 6);
});
it('getTotalEstimateMinute - exampleTaskDataのタスクの見積の合計は223分であること', () => {
  assert.equal(tasksUtil.getTotalEstimateMinute(exampleTaskData), 223);
});
it('getTotalActuallyMinute - exampleTaskDataのタスクの実績の合計は26分であること', () => {
  assert.equal(tasksUtil.getTotalActuallyMinute(exampleTaskData), 26);
});
it('getEstimateTimelineChartTasks - タイムラインチャートの生成のオブジェクトを正しく生成できること', () => {
  assert.deepEqual(
    tasksUtil.getEstimateTimelineChartTasks(exampleTaskData),
    [{ key: '見積', start: moment(exampleTaskData[0].startTime, constants.TIMEFMT).toDate(), end: moment(exampleTaskData[0].startTime, constants.TIMEFMT).add(exampleTaskData[0].estimate || 0, 'minutes').toDate(), title: '可燃ごみ' },
      { key: '見積', start: moment(exampleTaskData[1].startTime, constants.TIMEFMT).toDate(), end: moment(exampleTaskData[1].startTime, constants.TIMEFMT).add(exampleTaskData[1].estimate || 0, 'minutes').toDate(), title: 'メールチェック' },
      { key: '見積', start: moment(exampleTaskData[2].startTime, constants.TIMEFMT).toDate(), end: moment(exampleTaskData[2].startTime, constants.TIMEFMT).add(exampleTaskData[2].estimate || 0, 'minutes').toDate(), title: '予定表のチェック' },
      { key: '見積', start: moment(exampleTaskData[3].startTime, constants.TIMEFMT).toDate(), end: moment(exampleTaskData[3].startTime, constants.TIMEFMT).add(exampleTaskData[3].estimate || 0, 'minutes').toDate(), title: '日報' },
      { key: '見積', start: moment(exampleTaskData[4].startTime, constants.TIMEFMT).toDate(), end: moment(exampleTaskData[4].startTime, constants.TIMEFMT).add(exampleTaskData[4].estimate || 0, 'minutes').toDate(), title: '勤怠入力' },
      { key: '見積', start: moment(exampleTaskData[5].startTime, constants.TIMEFMT).toDate(), end: moment(exampleTaskData[5].startTime, constants.TIMEFMT).add(exampleTaskData[5].estimate || 0, 'minutes').toDate(), title: '朝会' },
      { key: '見積', start: moment(exampleTaskData[6].startTime, constants.TIMEFMT).toDate(), end: moment(exampleTaskData[6].startTime, constants.TIMEFMT).add(exampleTaskData[6].estimate || 0, 'minutes').toDate(), title: '#123 の対応' },
      { key: '見積', start: moment(exampleTaskData[7].startTime, constants.TIMEFMT).toDate(), end: moment(exampleTaskData[7].startTime, constants.TIMEFMT).add(exampleTaskData[7].estimate || 0, 'minutes').toDate(), title: '昼飯' }],
  );
});
it('getActuallyTimelineChartTasks - タイムラインチャートの生成のオブジェクトを正しく生成できること', () => {
  assert.deepEqual(
    tasksUtil.getActuallyTimelineChartTasks(exampleTaskData),
    [{ key: '実績', start: moment(exampleTaskData[0].startTime, constants.TIMEFMT).toDate(), end: moment(exampleTaskData[0].endTime, constants.TIMEFMT).toDate(), title: '可燃ごみ' },
      { key: '実績', start: moment(exampleTaskData[1].startTime, constants.TIMEFMT).toDate(), end: moment(exampleTaskData[1].endTime, constants.TIMEFMT).toDate(), title: 'メールチェック' },
      { key: '実績', start: moment(exampleTaskData[2].startTime, constants.TIMEFMT).toDate(), end: moment(exampleTaskData[2].endTime, constants.TIMEFMT).toDate(), title: '予定表のチェック' },
      { key: '実績', start: moment(exampleTaskData[3].startTime, constants.TIMEFMT).toDate(), end: moment(exampleTaskData[3].endTime, constants.TIMEFMT).toDate(), title: '日報' }],
  );
});
it('deleteUselessTaskProp - 無駄なプロパティがなくなっていること', () => {
  const exampleTaskData0 = util.cloneDeep(exampleTaskData[0]);
  exampleTaskData0.test = 'test';
  assert.deepEqual(tasksUtil.deleteUselessTaskProp(exampleTaskData0), exampleTaskData[0]);
});
