import moment from 'moment';
import Handsontable from 'handsontable';
import debounce from 'lodash.debounce';
import hotSchema from './schemas/hotSchema';
import constants from './constants';
import util from './util';
import logo from './images/logo.png';

const RED = '#ff9b9b';
const BLUE = '#4f93fc';
const GRAY = '#cfcfcf';

let notifiIds = [];

const columns = [
  {
    title: '作業内容',
    data: 'title',
    type: 'text',
    /* eslint no-param-reassign: ["error", { "props": false }] */
    renderer(instance, td, row, col, prop, value) {
      td.innerHTML = value;
      if (instance.getDataAtRowProp(row, 'startTime') !== '' && instance.getDataAtRowProp(row, 'endTime') !== '') {
        if (td.parentNode.classList.contains('progress')) td.parentNode.classList.remove('progress');
        td.parentNode.classList.add('done');
      } else {
        td.parentNode.classList.remove('done');
      }
      return td;
    },
  },
  {
    title: '<span title="見積時間 数値で入力してください。">見積(分)</span>',
    data: 'estimate',
    type: 'numeric',
    allowInvalid: false,
    colWidths: 32,
  },
  {
    title: '<span title="HH:mm の形式で入力してください。(例)19:20">開始時刻</span>',
    data: 'startTime',
    type: 'time',
    colWidths: 32,
    timeFormat: 'HH:mm',
    allowInvalid: false,
    correctFormat: true,
    renderer(instance, td, row, col, prop, value) {
      td.innerHTML = value;
      if (value !== '' && !td.parentNode.classList.contains('done')) {
        td.parentNode.classList.add('progress');
      }
      return td;
    },
  },
  {
    title: '<span title="HH:mm の形式で入力してください。(例)19:20">終了時刻</span>',
    data: 'endTime',
    type: 'time',
    colWidths: 32,
    timeFormat: 'HH:mm',
    allowInvalid: false,
    correctFormat: true,
    renderer(instance, td, row, col, prop, value) {
      td.innerHTML = value;
      if (value === '') {
        const startTimeVal = instance.getDataAtRowProp(row, 'startTime');
        const estimateVal = instance.getDataAtRowProp(row, 'estimate');
        if (startTimeVal !== '' && estimateVal !== '') {
          td.innerHTML = `<div style="color:${GRAY}">${moment(startTimeVal, 'HH:mm').add(estimateVal, 'minutes').format('HH:mm')}</div>`; // eslint-disable-line no-param-reassign
        }
      }
      return td;
    },
  },
  {
    title: '<span title="終了時刻を記入後、自動入力されます。 (編集不可)">実績(分)</span>',
    data: 'actually',
    type: 'numeric',
    readOnly: true,
    validator: false,
    colWidths: 40,
    /* eslint no-param-reassign: ["error", { "props": false }] */
    renderer(instance, td, row, col, prop, value) {
      td.classList.add('htDimmed');
      const startTimeVal = instance.getDataAtRowProp(row, 'startTime');
      const endTimeVal = instance.getDataAtRowProp(row, 'endTime');
      if (startTimeVal && endTimeVal) {
        const timeDiffMinute = util.getTimeDiffMinute(startTimeVal, endTimeVal);
        const overdue = timeDiffMinute - instance.getDataAtRowProp(row, 'estimate') || 0;
        if (overdue >= 1) {
          // 見積をオーバー
          value = `${timeDiffMinute}<span style="color:${RED}">(+${overdue})</span>`; // eslint-disable-line no-param-reassign
        } else if (overdue === 0) {
          // 見積と同じ
          value = timeDiffMinute; // eslint-disable-line no-param-reassign
        } else if (overdue <= -1) {
          // 見積より少ない
          value = `${timeDiffMinute}<span style="color:${BLUE}">(${overdue})</span>`; // eslint-disable-line no-param-reassign
        }
      } else {
        value = ''; // eslint-disable-line no-param-reassign
      }
      td.innerHTML = value;
      return td;
    },
  },
  {
    title: '備考',
    data: 'memo',
    type: 'text',
  },
];

const removeNotifi = (id) => {
  clearTimeout(id);
  const index = notifiIds.findIndex(notifiId => notifiId === id);
  if (index > -1) {
    notifiIds.splice(index, 1);
  }
};

const divideNotifiCellType = (type = 'startTime') => (type === 'startTime' ? 'startTime' : 'endTime');

const removeNotifiCell = (hotInstance, row, col, types) => {
  types.forEach((type) => {
    const target = divideNotifiCellType(type);
    const targetNotifiId = `${target}NotifiId`;
    const notifiId = hotInstance.getCellMeta(row, col)[targetNotifiId];
    if (notifiId) {
      removeNotifi(notifiId);
      hotInstance.removeCellMeta(row, col, targetNotifiId);
    }
  });
};

const setNotifiCell = (hotInstance, row, col, timeout, type) => {
  const target = divideNotifiCellType(type);
  // 権限を取得し通知を登録
  const permission = Notification.permission;
  const targetNotifiId = `${target}NotifiId`;
  // タイマーの2重登録にならないように既に登録されているタイマーを削除
  removeNotifiCell(hotInstance, row, col, [type]);
  // タイマーを登録(セルにタイマーIDを設定)
  const notifiId = setTimeout(() => {
    // タイマーが削除されていた場合には何もしない
    if (!hotInstance.getCellMeta(row, col)[targetNotifiId]) return;
    removeNotifiCell(hotInstance, row, col, [type]);
    let taskTitle = hotInstance.getDataAtRowProp(row, 'title');
    const taskTitleLabel = `[${target === 'startTime' ? '開始' : '終了'}] - `;
    taskTitle = taskTitle ? `${taskTitleLabel}${taskTitle}` : `${taskTitleLabel}無名タスク`;
    if (permission !== 'granted') {
      alert(taskTitle);
      window.focus();
      hotInstance.selectCell(row, hotInstance.propToCol(target));
    } else {
      const notifi = new Notification(taskTitle, {
        icon: logo,
      });
      notifi.onclick = () => {
        notifi.close();
        window.focus();
        hotInstance.selectCell(row, hotInstance.propToCol(target));
      };
    }
  }, timeout);
  notifiIds.push(notifiId);
  hotInstance.setCellMeta(row, col, targetNotifiId, notifiId);
};

const manageNotifi = (hotInstance, row, prop, newVal) => {
  const col = hotInstance.propToCol(prop);
  // 値が不正な場合は処理を抜ける
  if (!hotInstance.getCellMeta(row, col).valid) return;
  if (prop === 'startTime' || prop === 'estimate') {
    // ガードとstartTimeVal,estimateValの組み立て
    const startTimeVal = prop === 'startTime' ? newVal : hotInstance.getDataAtRowProp(row, 'startTime');
    const estimateVal = prop === 'estimate' ? newVal : hotInstance.getDataAtRowProp(row, 'estimate');
    // 開始時刻が空もしくは見積が空か0の場合、既に登録されている通知を削除
    if (startTimeVal === '' || estimateVal === '' || estimateVal === 0) {
      removeNotifiCell(hotInstance, row, col, ['startTime', 'endTime']);
      return;
    }
    const currentMoment = moment();
    const startTimeMoment = moment(startTimeVal, 'HH:mm');
    // --------------------------開始時刻に表示する通知の設定--------------------------
    const startTimeOut = startTimeMoment.diff(currentMoment);
    if (startTimeOut > 0) {
      setNotifiCell(hotInstance, row, col, startTimeOut, 'startTime');
    }
    // --------------------------終了時刻に表示する通知の設定--------------------------
    const endTimeOut = startTimeMoment.add(estimateVal, 'minutes').diff(currentMoment);
    if (endTimeOut > 0) {
      setNotifiCell(hotInstance, row, col, endTimeOut, 'endTime');
    }
  } else if (prop === 'endTime') {
    // 終了時刻を入力したのでstartTimeのセルにタイマーIDがあれば削除
    removeNotifiCell(hotInstance, row, hotInstance.propToCol('startTime'), ['startTime', 'endTime']);
  }
};

const bindClearNotifi = (hotInstance) => {
  hotInstance.addHook('clearNotifi', () => {
    notifiIds.forEach((notifiId) => {
      clearTimeout(notifiId);
    });
    notifiIds = [];
  });
};

const bindShortcut = (hotInstance) => {
  // ショートカット処理
  hotInstance.addHook('afterDocumentKeyDown', debounce((e) => {
    // ハンズオンテーブル以外のキーダウンイベントでは下記の処理をしない
    if (e.path && e.path[0] && e.path[0].id !== 'HandsontableCopyPaste') return;
    const selected = hotInstance.getSelected();
    if (!selected) return;
    const [startRow, startCol, endRow] = selected;
    if (e.ctrlKey) {
      if (constants.shortcuts.HOT_CURRENTTIME(e)) {
        // 現在時刻を入力
        const prop = hotInstance.colToProp(startCol);
        // 選択しているセルが1つかつ、開始時刻・終了時刻のカラム
        if ((prop === 'endTime' || prop === 'startTime')) {
          for (let row = startRow; row <= endRow; row += 1) {
            hotInstance.setDataAtCell(row, startCol, moment().format('HH:mm'));
          }
        }
      }
    }
  }, constants.KEYEVENT_DELAY));
};

export const getEmptyHotData = () => [util.cloneDeep(hotSchema)];

export const getEmptyRow = () => getEmptyHotData()[0];

export const getHotTasksIgnoreEmptyTask = (hotInstance) => {
  if (hotInstance) {
    const hotData = [];
    const rowCount = hotInstance.countSourceRows();
    for (let index = 0; index < rowCount; index += 1) {
      hotData[index] = hotInstance.getSourceDataAtRow(hotInstance.toPhysicalRow(index));
    }
    return util.cloneDeep(hotData.filter(data => !util.equal(getEmptyRow(), data)));
  }
  return getEmptyHotData();
};

export const setDataForHot = (hotInstance, datas) => {
  if (!Array.isArray(datas)) return;
  const dataForHot = [];
  util.cloneDeep(datas).forEach((data, rowIndex) => {
    if (!util.equal(getEmptyRow(), data)) {
      Object.entries(data).forEach(([key, value]) => {
        dataForHot.push([rowIndex, key, value]);
      });
    }
  });
  hotInstance.runHooks('clearNotifi');
  hotInstance.setDataAtRowProp(dataForHot);
};

export const hotConf = {
  autoRowSize: false,
  autoColumnSize: false,
  stretchH: 'all',
  comments: true,
  rowHeaders: true,
  rowHeaderWidth: 25,
  autoInsertRow: false,
  manualRowMove: true,
  minRows: 10,
  colWidths: Math.round(constants.APPWIDTH / columns.length),
  columns,
  data: getEmptyHotData(),
  dataSchema: hotSchema,
  afterChange(changes) {
    if (!changes) return;
    const changesLength = changes.length;
    for (let i = 0; i < changesLength; i += 1) {
      const [row, prop, oldVal, newVal] = changes[i];
      if ((prop === 'startTime' || prop === 'endTime' || prop === 'estimate') && oldVal !== newVal) {
        manageNotifi(this, row, prop, newVal);
      }
    }
  },
  beforeInit() {
    Handsontable.hooks.register('clearNotifi');
  },
  afterInit() {
    bindClearNotifi(this);
    bindShortcut(this);
  },
  afterDestroy() {
    Handsontable.hooks.deregister('clearNotifi');
  },
};
