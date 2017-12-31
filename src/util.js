import moment from 'moment';
import constants from './constants';

export default {
  getCrrentTimeObj() {
    const currentMoment = moment();
    return {
      hour: currentMoment.hour(),
      minute: currentMoment.minute(),
      second: currentMoment.second(),
    };
  },
  isSameObj(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  },
  handlePoolTaskProp(identifier) {
    let prop;
    if (identifier === constants.taskPool.HIGHPRIORITY) {
      prop = 'highPriorityTasks';
    } else if (identifier === constants.taskPool.LOWPRIORITY) {
      prop = 'lowPriorityTasks';
    } else if (identifier === constants.taskPool.REGULAR) {
      prop = 'regularTasks';
    } else if (identifier === constants.taskPool.DAILY) {
      prop = 'dailyTasks';
    }
    return prop;
  },
};
