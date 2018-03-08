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

const removeNotifiCell = (hotInstance, row, props) => {
  props.forEach((prop) => {
    const col = hotInstance.propToCol(prop);
    const targetNotifiId = `${prop}NotifiId`;
    const notifiId = hotInstance.getCellMeta(row, col)[targetNotifiId];
    if (notifiId) {
      removeNotifi(notifiId);
      hotInstance.removeCellMeta(row, col, targetNotifiId);
    }
  });
};

const setNotifiCell = (hotInstance, row, prop, timeout) => {
  // 権限を取得し通知を登録
  const permission = Notification.permission;
  const targetNotifiId = `${prop}NotifiId`;
  // タイマーの2重登録にならないように既に登録されているタイマーを削除
  removeNotifiCell(hotInstance, row, [prop]);
  // タイマーを登録(セルにタイマーIDを設定)
  const col = hotInstance.propToCol(prop);
  const notifiId = setTimeout(() => {
    // タイマーが削除されていた場合には何もしない
    if (!hotInstance.getCellMeta(row, col)[targetNotifiId]) return;
    removeNotifiCell(hotInstance, row, [prop]);
    let taskTitle = hotInstance.getDataAtRowProp(row, 'title');
    const taskTitleLabel = `[${prop === 'startTime' ? '開始' : '終了'}] - `;
    taskTitle = taskTitle ? `${taskTitleLabel}${taskTitle}` : `${taskTitleLabel}無名タスク`;
    if (permission !== 'granted') {
      alert(taskTitle);
      window.focus();
      hotInstance.selectCell(row, hotInstance.propToCol(prop));
    } else {
      const notifi = new Notification(taskTitle, { icon: logo });
      notifi.onclick = () => {
        notifi.close();
        window.focus();
        hotInstance.selectCell(row, hotInstance.propToCol(prop));
      };
    }
  }, timeout);
  notifiIds.push(notifiId);
  hotInstance.setCellMeta(row, col, targetNotifiId, notifiId);
};

/**
 * 通知を管理する処理。
 * ロジックは下記の通り
 * case0 [作成]・見積・開始時刻のペアが成立した→通知を予約する
 * case1 [削除]・見積・開始時刻のペアが不成立になった→通知を破棄する
 * case2 [削除]・終了時刻が入力された→通知を破棄する(case0のペアが成立している場合は新しい通知を予約)
 * case3 [更新]・見積・開始時刻のペアが成立した状態で見積or開始時刻が新しい値として入力された→既存の通知
 * 通知の情報は開始時刻の通知はstartTime,終了時刻はendTimeのcellMetaに設定する
 * @param  {Object} hotInstance
 * @param  {Integer} row
 * @param  {String} prop
 * @param  {any} newVal
 */
const manageNotifi = (hotInstance, row, prop, newVal) => {
  // 通知を設定するセルはstartTimeのカラム
  if (prop === 'estimate' || prop === 'startTime' || prop === 'endTime') {
    // ガードと値の組み立て
    const estimateVal = prop === 'estimate' ? newVal : hotInstance.getDataAtRowProp(row, 'estimate');
    const startTimeVal = prop === 'startTime' ? newVal : hotInstance.getDataAtRowProp(row, 'startTime');
    const endTimeVal = prop === 'endTime' ? newVal : hotInstance.getDataAtRowProp(row, 'endTime');
    // case1 見積が空か0,もしくは開始時刻が空の場合、既に登録されている通知を削除
    if (estimateVal === '' || estimateVal === 0 || startTimeVal === '') {
      removeNotifiCell(hotInstance, row, ['startTime', 'endTime']);
      return;
    }
    // case2 終了時刻が空じゃない場合、既に登録されている通知を削除
    if (endTimeVal !== '') {
      removeNotifiCell(hotInstance, row, ['startTime', 'endTime']);
    }
    const currentMoment = moment();
    const startTimeMoment = moment(startTimeVal, constants.TIMEFMT);
    // case0 or case3 setNotifiCellはupsertで通知を登録する
    // --------------------------開始時刻に表示する通知の設定--------------------------
    const startTimeOut = startTimeMoment.diff(currentMoment);
    if (startTimeOut > 0) {
      setNotifiCell(hotInstance, row, 'startTime', startTimeOut);
    }
    // --------------------------終了時刻に表示する通知の設定--------------------------
    const endTimeOut = startTimeMoment.add(estimateVal, 'minutes').diff(currentMoment);
    if (endTimeOut > 0) {
      setNotifiCell(hotInstance, row, 'endTime', endTimeOut);
    }
  }
};

const bindClearAllNotifi = (hotInstance) => {
  hotInstance.addHook('clearAllNotifi', () => {
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

export const getHotTasksIgnoreEmptyTask = (hotInstance) => {
  if (!hotInstance) return [];
  const hotData = [];
  const rowCount = hotInstance.countSourceRows();
  for (let index = 0; index < rowCount; index += 1) {
    if (!hotInstance.isEmptyRow(index)) {
      hotData.push(hotInstance.getSourceDataAtRow(hotInstance.toPhysicalRow(index)));
    }
  }
  return util.cloneDeep(hotData.filter(data => !util.equal(tableTaskSchema, data)));
};

export const setDataForHot = (hotInstance, datas) => {
  if (!Array.isArray(datas)) return;
  const dataForHot = [];
  let rowIndex = 0;
  util.cloneDeep(datas).forEach((data) => {
    if (!util.equal(tableTaskSchema, data)) {
      Object.entries(data).forEach(([key, value]) => {
        dataForHot.push([rowIndex, key, value]);
      });
    }
    rowIndex += 1;
  });
  const rowCount = getHotTasksIgnoreEmptyTask(hotInstance).length;
  // rowIndex これから入れる行数
  // rowCount 今の行数
  let needTrim = false;
  if (rowIndex < rowCount) needTrim = true;
  // 既に登録されている通知をすべてクリアし、データを設定
  hotInstance.runHooks('clearAllNotifi');
  hotInstance.setDataAtRowProp(dataForHot);
  // 不要な行を削除する
  if (needTrim) hotInstance.alter('remove_row', rowIndex, rowCount);
  // 保存ボタンが活性化するのを防ぐ
  hotInstance.runHooks('afterUpdateSettings');
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
  minRows: constants.HOT_MINROW,
  colWidths: Math.round(constants.APPWIDTH / columns.length),
  columns,
  data: [],
  dataSchema: tableTaskSchema,
  beforeInit() {
    Handsontable.hooks.register('clearAllNotifi');
  },
  afterInit() {
    bindClearAllNotifi(this);
    bindShortcut(this);
  },
  afterDestroy() {
    Handsontable.hooks.deregister('clearAllNotifi');
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
