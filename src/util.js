import moment from 'moment';
import uuid from 'uuid';
import fastclone from 'fast-clone';
import { deepEqual } from 'fast-equals';
import UAParser from 'ua-parser-js';
import constants from './constants';

export default {
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
  /**
   * ディープコピーを行います。
   * @param  {Object} obj オブジェクト
   */
  cloneDeep(obj) {
    return fastclone(obj);
  },
  /**
   * オブジェクトの比較を行います。
   * @param  {Object} a オブジェクト a
   * @param  {Object} b オブジェクト a
  */
  equal(a, b) {
    return deepEqual(a, b);
  },

  /**
   * getDayメソッドで取得したものを文字列の曜日に変換します。
   * https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Date/getDay
   * @param  {Number} dayOfWeek
   */
  convertDayOfWeekToString(dayOfWeek) {
    return constants.DAY_OF_WEEK_STR[dayOfWeek];
  },
  /**
   * 文字列の曜日からgetDayメソッドで取得できる数値の曜日に変換します。
   * https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Date/getDay
   * @param  {String} dayOfWeekStr
   */
  convertDayOfWeekFromString(dayOfWeekStr) {
    return constants.DAY_OF_WEEK_STR.findIndex(str => str === dayOfWeekStr);
  },
  /**
   * Dateオブジェクトから何週目の何曜日という情報を持ったオブジェクトを返します。
   * @param  {Date} date
   */
  getDayAndCount(date) {
    return { day: date.getDay(), count: Math.floor((date.getDate() - 1) / 7) + 1 };
  },
  /**
   * 文字列からワーカーを実行します。
   * @param  {String} script スクリプト
   * @param  {Array} data ワーカーに処理させるデータ
   * @param  {Function} success 成功処理
   * @param  {Function} failure 失敗処理
   */
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
   * @param  {Array} tasks タスク
   */
  getSortedTasks(tasks) {
    const hasStartTimeTasks = [];
    const hasNotStartTimeTasks = [];
    for (let i = 0; i < tasks.length; i += 1) {
      const task = this.cloneDeep(tasks[i]);
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

  isSupportBrowser() {
    const parser = new UAParser();
    const browserName = parser.getBrowser().name;
    return constants.SUPPORTEDBROWSERS.includes(browserName);
  },
};
