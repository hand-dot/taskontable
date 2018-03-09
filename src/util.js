import moment from 'moment';
import uuid from 'uuid';
import fastclone from 'fast-clone';
import { deepEqual } from 'fast-equals';
import constants from './constants';
import tableTaskSchema from './schemas/tableTaskSchema';
import poolTaskSchema from './schemas/poolTaskSchema';

export default {
  getExTableTaskProp() {
    const tableTaskSchemaKey = Object.keys(tableTaskSchema);
    const exSchemaKey = Object.keys(Object.assign({}, poolTaskSchema));
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
  /**
   * constants.DATEFMT形式の文字列が今日か判断します。
   * @param  {String} constants.DATEFMT形式の文字列
   */
  isToday(date) {
    return moment(date, constants.DATEFMT).isSame(new Date(), 'day');
  },
  /**
   * constants.TIMEFMT形式の文字列の2つの差分を分で求めます。
   * @param  {String} startTimeVal constants.TIMEFMT形式の文字列
   * @param  {String} endTimeVal constants.TIMEFMT形式の文字列
   */
  getTimeDiffMinute(startTimeVal = '00:00', endTimeVal = '00:00') {
    const [startTimeHour, startTimeMinute] = startTimeVal.split(':');
    const [endTimeHour, endTimeMinute] = endTimeVal.split(':');
    if (Number.isInteger(+startTimeHour) && Number.isInteger(+startTimeMinute) &&
    Number.isInteger(+endTimeHour) && Number.isInteger(+endTimeMinute)) {
      return moment(`${endTimeHour}:${endTimeMinute}`, constants.TIMEFMT).diff(moment(`${startTimeHour}:${startTimeMinute}`, constants.TIMEFMT), 'minutes');
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
  runWorker(script, data, success, failure) {
    const worker = new Worker(window.URL.createObjectURL(new Blob([`onmessage = ${script}`], { type: 'text/javascript' })));
    const promise = new Promise((resolve, reject) => {
      worker.onerror = (e) => {
        reject(e.message);
      };
      worker.onmessage = (e) => {
        resolve(e.data);
      };
    });
    worker.postMessage(data);
    promise.then((result) => {
      if (!Array.isArray(result)) {
        failure();
      } else {
        success(result);
      }
    }, (reason) => {
      failure(reason);
    });
  },
  setIdIfNotExist(obj) {
    return obj.id ? obj : Object.assign(obj, { id: uuid() });
  },
  
  /**
   * タスクを開始時刻順に並び替えます。
   * 開始時刻が空の場合は後ろに行きます。
   * 開始時刻が空のタスクは見積もりが小さい順に並び替えます。
   * @param  {Array} tasks
   */
  getSortedTasks(tasks) {
    return tasks.filter(task => task.startTime !== '').sort((a, b) => {
      if (a.startTime > b.startTime) return 1;
      if (a.startTime < b.startTime) return -1;
      return 0;
    }).concat(tasks.filter(task => task.startTime === '').sort((a, b) => {
      if (a.estimate > b.estimate) return 1;
      if (a.estimate < b.estimate) return -1;
      return 0;
    }));
  },
};
