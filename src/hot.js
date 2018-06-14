import moment from 'moment';
import Handsontable from 'handsontable';
import debounce from 'lodash.debounce';
import tableTaskSchema from './schemas/tableTaskSchema';
import constants from './constants';
import util from './util';
import notifiIcon from './images/notifiIcon.png';
import person from './images/person.svg';
import logoMini from './images/logo_mini.png';
import unknown from './images/unknown.png';

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
    // タイマーが削除されていた場合には何もしない
    if (!hotInstance.getCellMeta(row, col)[targetNotifiId]) return;
    removeNotifiCell(hotInstance, row, [prop]);
    // 他人に割り当てられた通知の場合は何もしない(空の場合は通知する)
    const assign = hotInstance.getDataAtRowProp(row, 'assign');
    if (assign !== '' && assign !== hotInstance.getSettings().userId) return;
    let taskTitle = hotInstance.getDataAtRowProp(row, 'title');
    let taskTitleLabel;
    if (snooz) {
      taskTitleLabel = 'スヌーズ';
    } else if (prop === 'startTime') {
      taskTitleLabel = '開始';
    } else {
      taskTitleLabel = '終了';
    }
    taskTitle = taskTitle ? `⏰ ${taskTitleLabel} - ${taskTitle}` : `⏰ ${taskTitleLabel} - 無名タスク`;
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
 * case1 [削除]・見積・開始時刻のペアが不成立になった→通知を破棄する
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
    if (assignVal !== '' && assignVal !== hotInstance.getSettings().userId) {
      removeNotifiCell(hotInstance, row, ['startTime', 'endTime']);
      return;
    }

    // ガードと値の組み立て
    const estimateVal = prop === 'estimate' ? newVal : hotInstance.getDataAtRowProp(row, 'estimate');
    const startTimeVal = prop === 'startTime' ? newVal : hotInstance.getDataAtRowProp(row, 'startTime');
    const endTimeVal = prop === 'endTime' ? newVal : hotInstance.getDataAtRowProp(row, 'endTime');

    // case1 見積が空か0,もしくは開始時刻が空の場合、既に登録されている通知を削除
    if (estimateVal === '' || estimateVal === 0 || startTimeVal === '') {
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
    if (e.path && e.path[0] && e.path[0].id !== 'HandsontableCopyPaste') return;
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
      if (confirm && !window.confirm('終了時刻もしくは開始時刻が入力されているタスクがあります。\n 再設定してもよろしいですか？')) return;
      for (let { row } = selection.start; row <= selection.end.row; row += 1) {
        hotInstance.setDataAtRowProp(row, 'endTime', '');
        hotInstance.setDataAtRowProp(row, 'startTime', moment().format(constants.TIMEFMT));
      }
    } else if (key === 'done_task') {
      let confirm = false;
      for (let { row } = selection.start; row <= selection.end.row; row += 1) {
        if (hotInstance.getDataAtRowProp(row, 'endTime') !== '') confirm = true;
      }
      if (confirm && !window.confirm('終了時刻が入力されているタスクがあります。\n 再設定してもよろしいですか？')) return;
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
    name: '[いつかやる]に戻す',
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
      const data = hotInstance.getSourceDataAtRow(hotInstance.toPhysicalRow(index));
      hotData.push(data);
    }
  }
  return util.cloneDeep(hotData.filter(data => !util.equal(tableTaskSchema, data)));
};

export const setDataForHot = (hotInstance, datas) => {
  if (!Array.isArray(datas)) return;
  const newDatas = [];
  datas.forEach((data) => {
    const startTimeVal = data.startTime;
    const endTimeVal = data.endTime;
    data.actually = startTimeVal && endTimeVal ? util.getTimeDiffMinute(startTimeVal, endTimeVal) : null;
    if (!util.equal(tableTaskSchema, data)) newDatas.push(data);
  });
  hotInstance.updateSettings({ data: newDatas });
  hotInstance.render();
};

const resetNotifi = debounce((hotInstance) => {
  // 通知をすべてクリアし、再設定(estimateで)
  if (!hotInstance.container) return;
  hotInstance.runHooks('clearAllNotifi');
  const rowCount = hotInstance.countSourceRows();
  for (let index = 0; index < rowCount; index += 1) {
    if (!hotInstance.isEmptyRow(index)) {
      const estimate = hotInstance.getDataAtRowProp(index, 'estimate');
      if (estimate) manageNotifi(hotInstance, index, 'estimate', estimate);
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
      title: '割当',
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
          if (td.parentNode.style.backgroundColor === constants.cellColor.RUNNING) {
            img.style.animation = `busy 3s ${row % 2}s infinite`;
          } else if (td.parentNode.style.backgroundColor === constants.cellColor.OUT) {
            img.style.animation = 'help 1s infinite';
          }
        } else {
          img.src = value ? unknown : logoMini; // unknownは削除されたユーザー
          img.title = value ? '@unknown' : '@every';
        }

        td.appendChild(img);
        return td;
      },
    },
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
      colWidths: 40,
    },
    {
      title: `開始時刻(${constants.TIMEFMT})`,
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
      title: `終了時刻(${constants.TIMEFMT})`,
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
          td.parentNode.style.backgroundColor = startTimeVal === '' ? constants.cellColor.WARNING : constants.cellColor.RUNNING;
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
      title: '実績(分)',
      data: 'actually',
      type: 'numeric',
      readOnly: true,
      validator: false,
      colWidths: 45,
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
      title: '備考',
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
      if (oldVal !== newVal && newVal && (prop !== 'assign') && this.isEmptyRow(row)) {
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
        if (prop === 'startTime' || prop === 'endTime' || prop === 'estimate') {
          const startTimeVal = prop === 'startTime' ? newVal : this.getDataAtRowProp(row, 'startTime');
          const endTimeVal = prop === 'endTime' ? newVal : this.getDataAtRowProp(row, 'endTime');
          this.setDataAtRowProp(row, 'actually', startTimeVal && endTimeVal ? util.getTimeDiffMinute(startTimeVal, endTimeVal) : null);
        }
        if (isActiveNotifi && (prop === 'startTime' || prop === 'endTime' || prop === 'estimate' || prop === 'assign')) {
          manageNotifi(this, row, prop, newVal);
        }
      }
    }
  },
};
