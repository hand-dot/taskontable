import chai from 'chai';
import exampleTaskData from '../exampleDatas/exampleTaskData';
import tasksUtil from '../tasksUtil';

const assert = chai.assert;
it('exampleTaskDataのタスクの見積の合計は223分であること', () => {
  assert.equal(tasksUtil.getTotalEstimateMinute(exampleTaskData), 223);
});
