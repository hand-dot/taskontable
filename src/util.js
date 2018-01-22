import moment from 'moment';
import fastclone from 'fast-clone';
import { deepEqual } from 'fast-equals';
import constants from './constants';
import hotSchema from './schemas/hotSchema';
import poolTaskSchema from './schemas/poolTaskSchema';
import tableTaskSchema from './schemas/tableTaskSchema';

// パフォーマンスチューニング用
// let c = 0;
// let s = 0;
export default {
  getExTableTaskProp() {
    const tableTaskSchemaKey = Object.keys(tableTaskSchema);
    const exSchemaKey = Object.keys(Object.assign({}, hotSchema, poolTaskSchema));
    return this.diffArray(tableTaskSchemaKey, exSchemaKey);
  },
  diffArray(arr1, arr2) {
    return arr1.concat(arr2)
      .filter(item => !arr1.includes(item) || !arr2.includes(item));
  },
  getCrrentTimeObj() {
    const currentMoment = moment();
    return {
      hour: currentMoment.hour(),
      minute: currentMoment.minute(),
      second: currentMoment.second(),
    };
  },
  getTimeDiff(startTimeVal = 0, endTimeVal = 0) { // HH:mm
    const [startTimeHour, startTimeMinute] = startTimeVal.split(':');
    const [endTimeHour, endTimeMinute] = endTimeVal.split(':');
    if (Number.isInteger(+startTimeHour) && Number.isInteger(+startTimeMinute) &&
    Number.isInteger(+endTimeHour) && Number.isInteger(+endTimeMinute)) {
      return moment().hour(endTimeHour).minute(endTimeMinute).second(0)
        .diff(moment().hour(startTimeHour).minute(startTimeMinute).second(0), 'minutes');
    }
    return 0;
  },
  cloneDeep(a) {
    // c += 1;
    // console.log('cloneDeep', c, Date.now());
    return fastclone(a);
  },
  equal(a, b) {
    // s += 1;
    // console.log('equal', s, Date.now());
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
