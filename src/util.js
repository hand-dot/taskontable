import moment from 'moment';
import fastclone from 'fast-clone';
import { deepEqual } from 'fast-equals';
import constants from './constants';
import hotSchema from './schemas/hotSchema';
import poolTaskSchema from './schemas/poolTaskSchema';
import tableTaskSchema from './schemas/tableTaskSchema';

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
  getTimeDiffMinute(startTimeVal = 0, endTimeVal = 0) { // HH:mm
    const [startTimeHour, startTimeMinute] = startTimeVal.split(':');
    const [endTimeHour, endTimeMinute] = endTimeVal.split(':');
    if (Number.isInteger(+startTimeHour) && Number.isInteger(+startTimeMinute) &&
    Number.isInteger(+endTimeHour) && Number.isInteger(+endTimeMinute)) {
      return moment(`${endTimeHour}:${endTimeMinute}`, 'HH:mm').diff(moment(`${startTimeHour}:${startTimeMinute}`, 'HH:mm'), 'minutes');
    }
    return 0;
  },
  cloneDeep(a) {
    return fastclone(a);
  },
  equal(a, b) {
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
