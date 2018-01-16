import moment from 'moment';
import fastclone from 'fast-clone';
import { deepEqual } from 'fast-equals';
import constants from './constants';

let c = 0;
let s = 0;
export default {
  getCrrentTimeObj() {
    const currentMoment = moment();
    return {
      hour: currentMoment.hour(),
      minute: currentMoment.minute(),
      second: currentMoment.second(),
    };
  },
  cloneDeep(a) {
    c += 1;
    console.log('cloneDeep', c, Date.now());
    return fastclone(a);
  },
  equal(a, b) {
    s += 1;
    console.log('equal', s, Date.now());
    return deepEqual(a, b);
  },
  getDayOfWeekStr(dayOfWeek) {
    return constants.DAY_OF_WEEK_STR[dayOfWeek];
  },
  getDayOfWeek(dayOfWeekStr) {
    return constants.DAY_OF_WEEK_STR.findIndex(str => str === dayOfWeekStr);
  },
  getDayAndCount(date) {
    return { day: date.getDay(), count: Math.floor((date.getDate() - 1) / 7) + 1 };
  },
};
