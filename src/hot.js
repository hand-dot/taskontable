import moment from 'moment';
import Handsontable from 'handsontable';
import debounce from 'lodash.debounce';
import tableTaskSchema from './schemas/tableTaskSchema';
import constants from './constants';
import util from './util';
import logo from './images/logo.png';

let notifiIds = [];

const columns = [
  {
    title: '作業内容',
    data: 'title',
    type: 'text',
  },
  {
    title: '見積(分)',
    data: 'estimate',
    type: 'numeric',
    allowInvalid: false,
    colWidths: 30,
  },
  {
    title: `開始時刻(${constants.TIMEFMT})`,
    data: 'startTime',
    type: 'time',
    colWidths: 60,
    timeFormat: constants.TIMEFMT,
    allowInvalid: false,
    correctFormat: true,
  },
  {
    title: `終了時刻(${constants.TIMEFMT})`,
    data: 'endTime',
    type: 'time',
    colWidths: 60,
    timeFormat: constants.TIMEFMT,
    allowInvalid: false,
    correctFormat: true,
    renderer(instance, td, row, col, prop, value) {
      td.innerHTML = value;
      td.parentNode.style.backgroundColor = '';
      const endTimeVal = value;
      const startTimeVal = instance.getDataAtRowProp(row, 'startTime');
      const estimateVal = instance.getDataAtRowProp(row, 'estimate');
      const isToday = instance.getSettings().isToday;
      if (endTimeVal !== '' && startTimeVal !== '') {
        // 完了しているタスク
        td.parentNode.style.backgroundColor = constants.cellColor.DONE;
      } else if (estimateVal === '' && instance.getDataAtRowProp(row, 'title') !== '') {
        // 見積もりが空なので警告にする
        td.parentNode.style.backgroundColor = constants.cellColor.WARNING;
      } else if (isToday && startTimeVal !== '' && estimateVal !== '') {
      // 本日のタスクの場合,開始時刻、見積もりが設定してあるタスクなので、実行中の色,予約の色,終了が近づいている色をつける処理
        const nowTimeVal = moment().format(constants.TIMEFMT);
        const expectedEndTimeVal = moment(startTimeVal, constants.TIMEFMT).add(estimateVal, 'minutes').format(constants.TIMEFMT);
        const timeDiffMinute = util.getTimeDiffMinute(nowTimeVal, expectedEndTimeVal);
        if (timeDiffMinute < 1) {
          td.parentNode.style.backgroundColor = constants.cellColor.OUT;
        } else {
          td.parentNode.style.backgroundColor = util.getTimeDiffMinute(nowTimeVal, startTimeVal) < 1 ? constants.cellColor.RUNNING : constants.cellColor.RESERVATION;
        }
        td.innerHTML = `<div style="color:${constants.brandColor.base.GREY}">${expectedEndTimeVal}</div>`; // eslint-disable-line no-param-reassign
      }
      return td;
    },
  },
  {
    title: '実績(分)',
    data: 'actually',
    type: 'numeric',
    readOnly: true,
    validator: false,
    colWidths: 30,
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
          value = `${timeDiffMinute}<span style="color:${constants.brandColor.base.RED}">(+${overdue})</span>`; // eslint-disable-line no-param-reassign
        } else if (overdue === 0) {
          // 見積と同じ
          value = timeDiffMinute; // eslint-disable-line no-param-reassign
        } else if (overdue <= -1) {
          // 見積より少ない
          value = `${timeDiffMinute}<span style="color:${constants.brandColor.base.BLUE}">(${overdue})</span>`; // eslint-disable-line no-param-reassign
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
  // 通知を設定するセルはstartTimeのカラム
  const col = hotInstance.propToCol('startTime');
  if (prop === 'startTime' || prop === 'estimate') {
    // ガードとstartTimeVal,estimateValの組み立て
    const startTimeVal = prop === 'startTime' ? newVal : hotInstance.getDataAtRowProp(row, 'startTime');
    const estimateVal = prop === 'estimate' ? newVal : hotInstance.getDataAtRowProp(row, 'estimate');
    // 終了時刻が既に入力されているもしくは開始時刻が空もしくは見積が空か0の場合、既に登録されている通知を削除
    if (hotInstance.getDataAtRowProp(row, 'endTime') !== '' || startTimeVal === '' || estimateVal === '' || estimateVal === 0) {
      removeNotifiCell(hotInstance, row, col, ['startTime', 'endTime']);
      return;
    }
    const currentMoment = moment();
    const startTimeMoment = moment(startTimeVal, constants.TIMEFMT);
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
    removeNotifiCell(hotInstance, row, col, ['startTime', 'endTime']);
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
    const selected = hotInstance.getSelectedLast();
    if (!selected) return;
    const [startRow, startCol, endRow, endCol] = selected;
    if (constants.shortcuts.HOT_CURRENTTIME(e)) {
      // 現在時刻を入力
      const startProp = hotInstance.colToProp(startCol);
      const endProp = hotInstance.colToProp(endCol);
      // 選択しているセルが1つかつ、開始時刻・終了時刻のカラム
      if (startProp === 'endTime' || startProp === 'startTime') {
        const currentTime = moment().format(constants.TIMEFMT);
        for (let row = startRow; row <= endRow; row += 1) {
          if (startCol !== endCol) {
            if (endProp === 'endTime' || endProp === 'startTime') {
              hotInstance.setDataAtCell(row, endCol, currentTime);
            }
          }
          hotInstance.setDataAtCell(row, startCol, currentTime);
        }
      }
    }
  }, constants.KEYEVENT_DELAY));
};

export const contextMenuCallback = (key, selections, hotInstance) => {
  selections.forEach((selection) => {
    if (key === 'start_task') {
      let confirm = false;
      for (let row = selection.start.row; row <= selection.end.row; row += 1) {
        if (hotInstance.getDataAtRowProp(row, 'endTime') !== '') confirm = true;
        if (hotInstance.getDataAtRowProp(row, 'startTime') !== '') confirm = true;
      }
      if (confirm && !window.confirm('終了時刻もしくは開始時刻が入力されているタスクがあります。\n 再設定してもよろしいですか？')) return;
      for (let row = selection.start.row; row <= selection.end.row; row += 1) {
        hotInstance.setDataAtRowProp(row, 'endTime', '');
        hotInstance.setDataAtRowProp(row, 'startTime', moment().format(constants.TIMEFMT));
      }
    } else if (key === 'done_task') {
      let confirm = false;
      for (let row = selection.start.row; row <= selection.end.row; row += 1) {
        if (hotInstance.getDataAtRowProp(row, 'endTime') !== '') confirm = true;
      }
      if (confirm && !window.confirm('終了時刻が入力されているタスクがあります。\n 再設定してもよろしいですか？')) return;
      for (let row = selection.start.row; row <= selection.end.row; row += 1) {
        // 開始時刻が空だった場合は現在時刻を設定する
        if (hotInstance.getDataAtRowProp(row, 'startTime') === '') hotInstance.setDataAtRowProp(row, 'startTime', moment().format(constants.TIMEFMT));
        hotInstance.setDataAtRowProp(row, 'endTime', moment().format(constants.TIMEFMT));
      }
    }
  });
};

export const contextMenuItems = {
  row_above: {
    name: '上に行を追加する',
  },
  row_below: {
    name: '下に行を追加する',
  },
  hsep1: '---------',
  remove_row: {
    name: '行を削除する',
  },
  hsep2: '---------',
  reverse_taskpool_hight: {
    name: '[すぐにやる]に戻す',
  },
  reverse_taskpool_low: {
    name: '[いつかやる]に戻す',
  },
  hsep3: '---------',
  start_task: {
    name: 'タスクを開始する',
  },
  done_task: {
    name: 'タスクを終了にする',
  },
};

export const setDataForHot = (hotInstance, datas) => {
  if (!Array.isArray(datas)) return;
  const dataForHot = [];
  util.cloneDeep(datas).forEach((data, rowIndex) => {
    if (!util.equal(tableTaskSchema, data)) {
      Object.entries(data).forEach(([key, value]) => {
        dataForHot.push([rowIndex, key, value]);
      });
    }
  });
  hotInstance.runHooks('clearNotifi');
  hotInstance.setDataAtRowProp(dataForHot);
};

export const getHotTasksIgnoreEmptyTask = (hotInstance) => {
  if (!hotInstance) return [];
  const hotData = [];
  const rowCount = hotInstance.countSourceRows();
  for (let index = 0; index < rowCount; index += 1) {
    hotData[index] = hotInstance.getSourceDataAtRow(hotInstance.toPhysicalRow(index));
  }
  return util.cloneDeep(hotData.filter(data => !util.equal(tableTaskSchema, data)));
};

export const hotBaseConf = {
  selectionMode: 'range',
  autoRowSize: false,
  autoColumnSize: false,
  stretchH: 'all',
  rowHeaders: true,
  rowHeaderWidth: 25,
  autoInsertRow: false,
  manualRowMove: true,
  minRows: 20,
  colWidths: Math.round(constants.APPWIDTH / columns.length),
  columns,
  data: [],
  dataSchema: tableTaskSchema,
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

export const hotConf = Object.assign({}, hotBaseConf, {
  afterRowMove() {
    const rowCount = this.countSourceRows();
    for (let index = 0; index < rowCount; index += 1) {
      manageNotifi(this, index, 'estimate', this.getDataAtRowProp(this.toPhysicalRow(index), 'estimate'));
    }
  },
  afterChange(changes) {
    if (!changes) return;
    if (!this.getSettings().isToday) return;
    const changesLength = changes.length;
    for (let i = 0; i < changesLength; i += 1) {
      const [row, prop, oldVal, newVal] = changes[i];
      if ((prop === 'startTime' || prop === 'endTime' || prop === 'estimate') && oldVal !== newVal) {
        manageNotifi(this, row, prop, newVal);
      }
    }
  },
});
