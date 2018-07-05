import moment from 'moment';
import Handsontable from 'handsontable';
import debounce from 'lodash.debounce';
import tableTaskSchema from './schemas/tableTaskSchema';
import constants from './constants';
import util from './util';
import i18n from './i18n';
import notifiIcon from './images/notifiIcon.png';
import person from './images/person.svg';
import logoMini from './images/logo_mini.png';
import unknown from './images/unknown.png';
import doorknock from './sounds/doorknock.mp3';

let notifiIds = [];

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

const setNotifiCell = (hotInstance, row, prop, timeout, snooz) => {
  // 権限を取得し通知を登録
  const { permission } = Notification;
  const targetNotifiId = `${prop}NotifiId`;
  // タイマーの2重登録にならないように既に登録されているタイマーを削除
  removeNotifiCell(hotInstance, row, [prop]);
  // タイマーを登録(セルにタイマーIDを設定)
  const col = hotInstance.propToCol(prop);
  const notifiId = setTimeout(() => {
    if (!hotInstance) return;
    // タイマーが削除されていた場合には何もしない
    if (!hotInstance.getCellMeta(row, col)[targetNotifiId]) return;
    removeNotifiCell(hotInstance, row, [prop]);
    // 他人に割り当てられた通知の場合は何もしない(空の場合は通知する)
    const assign = hotInstance.getDataAtRowProp(row, 'assign');
    const { userId } = hotInstance.getSettings();
    if (assign !== '' && userId !== '' && assign !== userId) return;
    let taskTitle = hotInstance.getDataAtRowProp(row, 'title');
    let taskTitleLabel;
    if (snooz) {
      taskTitleLabel = i18n.t('hot.snooz');
    } else if (prop === 'startTime') {
      taskTitleLabel = i18n.t('hot.start');
    } else {
      taskTitleLabel = i18n.t('hot.end');
    }
    taskTitle = `⏰[${taskTitleLabel}] - ${taskTitle || i18n.t('common.anonymousTask')}`;
    new Audio(doorknock).play();
    if (permission !== 'granted') {
      alert(taskTitle);
      window.focus();
      hotInstance.selectCell(row, hotInstance.propToCol(prop));
    } else {
      const notifi = new Notification(taskTitle, { icon: notifiIcon });
      notifi.onclick = () => {
        notifi.close();
        window.focus();
        hotInstance.selectCell(row, hotInstance.propToCol(prop));
      };
      notifi.onclose = () => {
        // FIXME このrowが通知を発行した瞬間の行番号なので、通知が来る頃にはずれている可能性がある。結果的にスヌーズがずっと来る可能性がある。
        if (hotInstance.getDataAtRowProp(row, 'endTime')) return;// 終了時刻が設定されていた場合には何もしない
        if (prop === 'endTime') setNotifiCell(hotInstance, row, 'endTime', 300000, true); // 終了の通知が放置されないように通知を5分後に再設定
      };
    }
  }, timeout);
  notifiIds.push(notifiId);
  hotInstance.setCellMeta(row, col, targetNotifiId, notifiId);
  hotInstance.render(); // メタをセットしたのでレンダラーで表示しているアイコンを移動させるためにレンダー
};

/**
 * 通知を管理する処理。
 * ロジックは下記の通り
 * case0 [作成]・見積・開始時刻のペアが成立した→通知を予約する
 * case1 [削除]・開始時刻のペアが不成立になった→通知を破棄する
 * case2 [削除]・終了時刻が入力された→通知を破棄する
 * case3 [削除・更新]・終了時刻が空になった→通知を破棄し、新しい通知を設定する
 * case4 [更新]・見積・開始時刻のペアが成立した状態で見積or開始時刻が新しい値として入力された→既存の通知
 * case5 [削除]・割り当てに自分以外(空白は含まない)を入力された→通知を破棄する
 * 通知の情報は開始時刻の通知はstartTime,終了時刻はendTimeのcellMetaに設定する
 * @param  {Object} hotInstance
 * @param  {Integer} row
 * @param  {String} prop
 * @param  {any} newVal
 */
const manageNotifi = (hotInstance, row, prop, newVal) => {
  if (prop === 'estimate' || prop === 'startTime' || prop === 'endTime' || prop === 'assign') {
    // case5 他人に割り当てられた通知の場合は削除(空の場合は通知する)
    const assignVal = prop === 'assign' ? newVal : hotInstance.getDataAtRowProp(row, 'assign');
    const { userId } = hotInstance.getSettings();
    if (assignVal !== '' && userId !== '' && assignVal !== userId) {
      removeNotifiCell(hotInstance, row, ['startTime', 'endTime']);
      return;
    }

    // ガードと値の組み立て
    const estimateVal = prop === 'estimate' ? newVal : hotInstance.getDataAtRowProp(row, 'estimate');
    const startTimeVal = prop === 'startTime' ? newVal : hotInstance.getDataAtRowProp(row, 'startTime');
    const endTimeVal = prop === 'endTime' ? newVal : hotInstance.getDataAtRowProp(row, 'endTime');

    // case1 開始時刻が空の場合、既に登録されている通知を削除
    if (startTimeVal === '') {
      removeNotifiCell(hotInstance, row, ['startTime', 'endTime']);
      return;
    }

    if (endTimeVal === '') { // case3 終了時刻に空を入力された場合通知を破棄し、新しい通知を設定
      removeNotifiCell(hotInstance, row, ['startTime', 'endTime']);
    } else { // case2 終了時刻が入力された場合、既に登録されている通知を削除
      removeNotifiCell(hotInstance, row, ['startTime', 'endTime']);
      return;
    }
    const currentMoment = moment();
    const startTimeMoment = moment(startTimeVal, constants.TIMEFMT);
    // case0 or case4 setNotifiCellはupsertで通知を登録する
    // --------------------------開始時刻に表示する通知の設定--------------------------
    const startTimeOut = startTimeMoment.diff(currentMoment);
    if (startTimeOut > 0) {
      setNotifiCell(hotInstance, row, 'startTime', startTimeOut);
    }
    // 見積が空もしくは0なので終了時刻の予約はできない
    if (estimateVal === '' || estimateVal === 0) return;
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
  hotInstance.addHook('afterDocumentKeyDown', (e) => {
    // ハンズオンテーブル以外のキーダウンイベントでは下記の処理をしない
    if (e.realTarget.className !== 'handsontableInput') return;
    if (constants.shortcuts.HOT_CURRENTTIME(e)) {
      e.preventDefault();
      const selected = hotInstance.getSelectedLast();
      if (!selected) return;
      const [startRow, startCol, endRow, endCol] = selected;
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
  });
};

export const contextMenuCallback = (key, selections, hotInstance) => {
  selections.forEach((selection) => {
    if (key === 'start_task') {
      let confirm = false;
      for (let { row } = selection.start; row <= selection.end.row; row += 1) {
        if (hotInstance.getDataAtRowProp(row, 'endTime') !== '') confirm = true;
        if (hotInstance.getDataAtRowProp(row, 'startTime') !== '') confirm = true;
      }
      if (confirm && !window.confirm(i18n.t('hot.resetTime'))) return;
      for (let { row } = selection.start; row <= selection.end.row; row += 1) {
        hotInstance.setDataAtRowProp(row, 'endTime', '');
        hotInstance.setDataAtRowProp(row, 'startTime', moment().format(constants.TIMEFMT));
      }
    } else if (key === 'done_task') {
      let confirm = false;
      for (let { row } = selection.start; row <= selection.end.row; row += 1) {
        if (hotInstance.getDataAtRowProp(row, 'endTime') !== '') confirm = true;
      }
      if (confirm && !window.confirm(i18n.t('hot.resetTime'))) return;
      for (let { row } = selection.start; row <= selection.end.row; row += 1) {
        // 開始時刻が空だった場合は現在時刻を設定する
        if (hotInstance.getDataAtRowProp(row, 'startTime') === '') hotInstance.setDataAtRowProp(row, 'startTime', moment().format(constants.TIMEFMT));
        hotInstance.setDataAtRowProp(row, 'endTime', moment().format(constants.TIMEFMT));
      }
    }
  });
};

export const contextMenuItems = {
  row_above: {
    name: i18n.t('hot.rowAbove'),
  },
  row_below: {
    name: i18n.t('hot.rowBelow'),
  },
  hsep1: '---------',
  remove_row: {
    name: i18n.t('hot.removeRow'),
  },
  hsep2: '---------',
  reverse_taskpool_hight: {
    name: i18n.t('hot.reverseTaskpoolHight'),
    disabled() {
      const selected = this.getSelectedLast();
      const startRow = selected[0];
      const endRow = selected[2];
      const selectedEndTimes = [];
      for (let row = startRow; row <= endRow; row += 1) {
        selectedEndTimes.push(this.getDataAtRowProp(row, 'endTime'));
      }
      return selectedEndTimes.some(selectedEndTime => selectedEndTime !== '');
    },
  },
  reverse_taskpool_low: {
    name: i18n.t('hot.reverseTaskpoolLow'),
    disabled() {
      const selected = this.getSelectedLast();
      const startRow = selected[0];
      const endRow = selected[2];
      const selectedEndTimes = [];
      for (let row = startRow; row <= endRow; row += 1) {
        selectedEndTimes.push(this.getDataAtRowProp(row, 'endTime'));
      }
      return selectedEndTimes.some(selectedEndTime => selectedEndTime !== '');
    },
  },
  hsep3: '---------',
  start_task: {
    name: i18n.t('hot.startTask'),
  },
  done_task: {
    name: i18n.t('hot.doneTask'),
  },
};

export const getHotTasksIgnoreEmptyTask = (hotInstance) => {
  if (!hotInstance) return [];
  const hotData = [];
  const rowCount = hotInstance.countSourceRows();
  for (let index = 0; index < rowCount; index += 1) {
    if (!hotInstance.isEmptyRow(index)) {
      const data = hotInstance.getSourceDataAtRow(hotInstance.toPhysicalRow(index));
      hotData.push(data);
    }
  }
  return util.cloneDeep(hotData.filter(data => !util.equal(tableTaskSchema, data)));
};

export const setDataForHot = (hotInstance, datas) => {
  if (!Array.isArray(datas)) return;
  const dataForHot = [];
  let rowIndex = 0;
  datas.forEach((data) => {
    if (!util.equal(tableTaskSchema, data)) {
      Object.entries(data).forEach(([key, value]) => {
        dataForHot.push([rowIndex, key, value]);
      });
    }
    rowIndex += 1;
  });
  const rowCount = hotInstance.countRows();
  // rowIndex これから入れる行数
  // rowCount 今の行数
  let needTrim = false;
  if (rowIndex < rowCount) needTrim = true;
  hotInstance.setDataAtRowProp(dataForHot);
  // 不要な行を削除する
  if (needTrim) hotInstance.alter('remove_row', rowIndex, rowCount);
  // 保存ボタンが活性化するのを防ぐ
  hotInstance.runHooks('afterUpdateSettings');
};

const resetNotifi = debounce((hotInstance) => {
  // 通知をすべてクリアし、再設定(estimateで)
  if (!hotInstance.container) return;
  hotInstance.runHooks('clearAllNotifi');
  const rowCount = hotInstance.countSourceRows();
  for (let index = 0; index < rowCount; index += 1) {
    if (!hotInstance.isEmptyRow(index)) {
      const estimate = hotInstance.getDataAtRowProp(index, 'estimate');
      manageNotifi(hotInstance, index, 'estimate', estimate || 0);
    }
  }
}, 1000);

export const hotConf = {
  userId: '', // 独自プロパティ
  members: [], // 独自プロパティ
  isActiveNotifi: false, // 独自プロパティ
  selectionMode: 'range',
  autoRowSize: false,
  autoColumnSize: false,
  stretchH: 'all',
  rowHeaders: true,
  rowHeaderWidth: 25,
  autoInsertRow: false,
  manualRowMove: true,
  minRows: constants.HOT_MINROW,
  colWidths: Math.round(window.innerWidth / 7),
  columns: [
    {
      title: i18n.t('columns.assign'),
      data: 'assign',
      editor: 'select',
      selectOptions: [],
      colWidths: 25,
      renderer(instance, td, row, col, prop, value) {
        if (instance.isEmptyRow(row)) {
          td.innerHTML = null;
          return td;
        }
        const { members } = instance.getSettings();
        if (!members) {
          td.innerHTML = null;
          return td;
        }
        const assingedUser = members[members.findIndex(member => member.uid === value)];
        td.className = 'htCenter htMiddle';
        td.style.paddingTop = '5px';
        Handsontable.dom.empty(td);
        const img = document.createElement('IMG');
        img.style.width = '25px';
        img.style.height = '25px';
        img.style.borderRadius = '50%';
        if (assingedUser) {
          img.src = assingedUser.photoURL || person;
        } else {
          img.src = value ? unknown : logoMini; // unknownは削除されたユーザー
          img.title = value ? '@unknown' : '@every';
        }
        if (td.parentNode.style.backgroundColor === constants.cellColor.RUNNING) {
          img.style.animation = `busy 3s ${row % 3}s infinite`;
        } else if (td.parentNode.style.backgroundColor === constants.cellColor.OUT) {
          img.style.animation = 'help 1s infinite';
        }
        td.appendChild(img);
        return td;
      },
    },
    {
      title: i18n.t('columns.title'),
      data: 'title',
      type: 'text',
    },
    {
      title: i18n.t('columns.estimateWithUnit'),
      data: 'estimate',
      type: 'numeric',
      allowInvalid: false,
      colWidths: 50,
    },
    {
      title: i18n.t('columns.startTimeWithFMT'),
      data: 'startTime',
      type: 'time',
      colWidths: 70,
      timeFormat: constants.TIMEFMT,
      allowInvalid: false,
      correctFormat: true,
      renderer(instance, td, row, col, prop, value, cellProperties) {
        if (!value) {
          td.innerHTML = null;
          return td;
        }
        const { isActiveNotifi } = instance.getSettings();
        td.innerHTML = `${value} ${isActiveNotifi && cellProperties.startTimeNotifiId ? '⏰' : ''}`; // eslint-disable-line no-param-reassign
        return td;
      },
    },
    {
      title: i18n.t('columns.endTimeWithFMT'),
      data: 'endTime',
      type: 'time',
      colWidths: 70,
      timeFormat: constants.TIMEFMT,
      allowInvalid: false,
      correctFormat: true,
      renderer(instance, td, row, col, prop, value, cellProperties) {
        td.innerHTML = value;
        td.parentNode.style.backgroundColor = '';
        const endTimeVal = value;
        const startTimeVal = instance.getDataAtRowProp(row, 'startTime');
        const estimateVal = instance.getDataAtRowProp(row, 'estimate');
        const { isActiveNotifi } = instance.getSettings();
        if (endTimeVal !== '' && startTimeVal !== '') {
          // 完了しているタスク
          td.parentNode.style.backgroundColor = constants.cellColor.DONE;
        } else if (estimateVal === '' && instance.getDataAtRowProp(row, 'title') !== '') {
          // 見積もりが空なので警告にする。開始していたら実行中の色を付ける。
          if (startTimeVal === '') {
            td.parentNode.style.backgroundColor = constants.cellColor.WARNING;
          } else {
            const nowTimeVal = moment().format(constants.TIMEFMT);
            td.parentNode.style.backgroundColor = util.getTimeDiffMinute(nowTimeVal, startTimeVal) < 1 ? constants.cellColor.RUNNING : constants.cellColor.RESERVATION;
          }
        } else if (isActiveNotifi && startTimeVal !== '' && estimateVal !== '') {
          // 本日のタスクの場合,開始時刻、見積もりが設定してあるタスクなので、実行中の色,予約の色,終了が近づいている色をつける処理
          const nowTimeVal = moment().format(constants.TIMEFMT);
          const expectedEndTimeVal = moment(startTimeVal, constants.TIMEFMT).add(estimateVal, 'minutes').format(constants.TIMEFMT);
          const timeDiffMinute = util.getTimeDiffMinute(nowTimeVal, expectedEndTimeVal);
          if (timeDiffMinute < 1) {
            td.parentNode.style.backgroundColor = constants.cellColor.OUT;
          } else {
            td.parentNode.style.backgroundColor = util.getTimeDiffMinute(nowTimeVal, startTimeVal) < 1 ? constants.cellColor.RUNNING : constants.cellColor.RESERVATION;
          }
          td.innerHTML = `<span style="color:${constants.brandColor.base.GREY}">${expectedEndTimeVal} ${isActiveNotifi && cellProperties.endTimeNotifiId ? '⏰' : ''}</span>`; // eslint-disable-line no-param-reassign
        }
        return td;
      },
    },
    {
      title: i18n.t('columns.actually'),
      data: 'actually',
      type: 'numeric',
      readOnly: true,
      validator: false,
      colWidths: 50,
      /* eslint no-param-reassign: ["error", { "props": false }] */
      renderer(instance, td, row, col, prop, value) {
        if (value === null || value === '') {
          td.innerHTML = null;
          return td;
        }
        const estimate = instance.getDataAtRowProp(row, 'estimate');
        const overdue = estimate ? value - estimate : 0;
        if (overdue >= 1) {
          // 見積をオーバー
          td.innerHTML = `${value}<span style="color:${constants.brandColor.base.RED}">(+${overdue})</span>`;
        } else if (overdue === 0) {
          // 見積と同じ
          td.innerHTML = value;
        } else if (overdue <= -1) {
          // 見積より少ない
          td.innerHTML = `${value}<span style="color:${constants.brandColor.base.BLUE}">(${overdue})</span>`;
        }
        return td;
      },
    },
    {
      title: i18n.t('columns.memo'),
      data: 'memo',
      type: 'text',
    },
  ],
  dataSchema: tableTaskSchema,
  beforeInit() {
    Handsontable.hooks.register('clearAllNotifi');
  },
  afterInit() {
    // 1分間に1回レンダーする
    this.hotIntervalID = setInterval(() => { if (moment().format('s') === '0') this.render(); }, 1000);
    bindClearAllNotifi(this);
    bindShortcut(this);
  },
  afterDestroy() {
    if (this.hotIntervalID) clearInterval(this.hotIntervalID);
    Handsontable.hooks.deregister('clearAllNotifi');
  },
  afterRowMove() {
    // 行がずれるので通知を再設定
    resetNotifi(this);
  },
  afterRemoveRow() {
    // 行がずれるので通知を再設定
    resetNotifi(this);
  },
  afterCreateRow() {
    // 行がずれるので通知を再設定
    resetNotifi(this);
  },
  beforeChange(changes) {
    if (!changes) return;
    const { userId } = this.getSettings();
    if (!userId) return;
    const changesLength = changes.length;
    for (let i = 0; i < changesLength; i += 1) {
      const [row, prop, oldVal, newVal] = changes[i];
      // 新規にタスクを作成した場合に下記の処理で割当を自分に自動で設定する
      if (newVal && oldVal !== newVal && prop !== 'assign' && this.isEmptyRow(row)) {
        this.setDataAtRowProp(row, 'assign', userId);
      }
    }
  },
  afterChange(changes) {
    if (!changes) return;
    const { isActiveNotifi, columns } = this.getSettings();
    const changesLength = changes.length;
    const assignIndex = columns.findIndex(column => column.data === 'assign');
    for (let i = 0; i < changesLength; i += 1) {
      const [row, prop, oldVal, newVal] = changes[i];
      if (oldVal !== newVal) {
        // 下記の処理で割当以外が全て空だった場合に割当を自動的に削除する
        if (prop !== 'assign' && !newVal && this.getDataAtRow(row).every((data, index) => (index === assignIndex ? data : !data))) {
          this.setDataAtRowProp(row, 'assign', '');
        }
        if (prop === 'startTime' || prop === 'endTime') {
          if (newVal) {
            const startTimeVal = prop === 'startTime' ? newVal : this.getDataAtRowProp(row, 'startTime');
            const endTimeVal = prop === 'endTime' ? newVal : this.getDataAtRowProp(row, 'endTime');
            if (startTimeVal && endTimeVal) this.setDataAtRowProp(row, 'actually', util.getTimeDiffMinute(startTimeVal, endTimeVal));
          } else if (oldVal) {
            this.setDataAtRowProp(row, 'actually', null);
          }
        }
        if (isActiveNotifi && (prop === 'startTime' || prop === 'endTime' || prop === 'estimate' || prop === 'assign')) {
          manageNotifi(this, row, prop, newVal);
        }
      }
    }
  },
};
