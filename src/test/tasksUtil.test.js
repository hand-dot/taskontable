import chai from 'chai';
import exampleTaskData from '../exampleDatas/exampleTaskData';
import tasksUtil from '../tasksUtil';

const assert = chai.assert;
it('getTotalEstimateMinute - exampleTaskDataのタスクの見積の合計は223分であること', () => {
  assert.equal(tasksUtil.getTotalEstimateMinute(exampleTaskData), 223);
});
it('getTotalActuallyMinute - exampleTaskDataのタスクの実績の合計は26分であること', () => {
  assert.equal(tasksUtil.getTotalActuallyMinute(exampleTaskData), 26);
});
