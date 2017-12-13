import moment from 'moment';
import cloneDeep from 'lodash.clonedeep';
import constants from './constants';

// FIXME リファクタリング #66
let prevPrevKey = null;
let prevKey = null;

const dataSchema = { actually: '', category: '', done: false, endTime: '', estimate: '', memo: '', startTime: '', title: '' };
const columns = [
  {
    title: '<span title="タスクが完了すると自動でチェックされます。(編集不可) ">済</span>',
    data: 'done',
    type: 'checkbox',
    colWidths: 20,
    readOnly: true,
    className: 'htCenter htMiddle',
  },
  {
    title: '<span title="タスクの分類項目として使用する。">カテゴリ</span>',
    data: 'category',
    type: 'dropdown',
    source: [],
    colWidths: 50,
    validator: false,
  },
  {
    title: '<span title="具体的な作業(タスク)の内容を入力してください。">作業内容</span>',
    data: 'title',
    type: 'text',
  },
  {
    title: '<span title="見積時間 数値で入力してください。">見積(分)</span>',
    data: 'estimate',
    type: 'numeric',
    colWidths: 45,
  },
  {
    title: '<span title="HH:mm の形式で入力してください。(例)19:20">開始時刻</span>',
    data: 'startTime',
    type: 'time',
    colWidths: 45,
    timeFormat: 'HH:mm',
    correctFormat: true,
    renderer(instance, td, row, col, prop, value, cellProperties) {
      td.innerHTML = value;
      const notification = cellProperties.notification;
      if (notification) {
        td.innerHTML = `<div title="${notification.time}通知予約済">${value} <i class="fa fa-bell-o"></i></div>`; // eslint-disable-line no-param-reassign
      }
      return td;
    },
  },
  {
    title: '<span title="HH:mm の形式で入力してください。(例)19:20">終了時刻</span>',
    data: 'endTime',
    type: 'time',
    colWidths: 45,
    timeFormat: 'HH:mm',
    correctFormat: true,
  },
  {
    title: '<span title="終了時刻を記入後、自動入力されます。 (編集不可)">実績(分)</span>',
    data: 'actually',
    type: 'numeric',
    validator: false,
    colWidths: 45,
    readOnly: true,
    /* eslint no-param-reassign: ["error", { "props": false }] */
    renderer(instance, td, row, col, prop, value, cellProperties) {
      td.innerHTML = value;
      if (cellProperties.overdue) {
        td.style.color = '#ff9b9b';
      } else if (cellProperties.overdue === false) {
        td.style.color = '#4f93fc';
      }
      return td;
    },
  },
  {
    title: '<span title="タスクの実行に役立つ参照情報(メモ)を入力します。">備考</span>',
    data: 'memo',
    type: 'text',
  },
];

const setValidtionMessage = (hotInstance, row, prop, isValid) => {
  const commentsPlugin = hotInstance.getPlugin('comments');
  const col = hotInstance.propToCol(prop);
  if (isValid) {
    commentsPlugin.removeCommentAtCell(row, col);
  } else {
    let comment = '';
    if (prop === 'estimate') {
      comment = '半角数値を入力してください';
    } else if (prop === 'startTime' || prop === 'endTime') {
      comment = '半角数値,カンマ区切りで有効な時刻を入力してください';
    }
    commentsPlugin.setCommentAtCell(row, col, comment);
    commentsPlugin.showAtCell(row, col);
  }
};

const calculateTask = (hotInstance, row, prop) => {
  const col = hotInstance.propToCol(prop);
  if (prop === 'startTime' || prop === 'endTime') {
    // 変更したセルが開始時刻 or 終了時刻の場合、実績を自動入力し、済をチェックする処理
    const startTimeVal = hotInstance.getDataAtRowProp(row, 'startTime');
    const endTimeVal = hotInstance.getDataAtRowProp(row, 'endTime');
    if (startTimeVal === null || endTimeVal === null) return;
    if (startTimeVal === '' || endTimeVal === '') {
      // 入力値が空の場合、実績を空にし、済のチェックをはずす
      hotInstance.setDataAtRowProp(row, 'done', false);
      hotInstance.setDataAtRowProp(row, 'actually', '');
    } else if (startTimeVal.indexOf(':') !== -1 && endTimeVal.indexOf(':') !== -1) {
      // 実績を入力し、済をチェックする処理の開始
      const [startTimeHour, startTimeMinute] = startTimeVal.split(':');
      const [endTimeHour, endTimeMinute] = endTimeVal.split(':');
      // 入力値のチェック
      if (!Number.isInteger(+startTimeHour) && !Number.isInteger(+startTimeMinute) &&
      !Number.isInteger(+endTimeHour) && !Number.isInteger(+endTimeMinute)) return;
      // 開始時刻、終了時刻が有効な値の場合
      const diff = moment().hour(endTimeHour).minute(endTimeMinute).diff(moment().hour(startTimeHour).minute(startTimeMinute), 'minutes');
      const commentsPlugin = hotInstance.getPlugin('comments');
      if (!isNaN(diff) && Math.sign(diff) !== -1) {
        // 実績を入力し、済をチェックする
        hotInstance.setDataAtRowProp(row, 'actually', diff);
        hotInstance.setDataAtRowProp(row, 'done', true);
        // ヴァリデーションエラーを消す処理
        const targetCol = hotInstance.propToCol(prop === 'startTime' ? 'endTime' : 'startTime');
        const targetCellMeta = hotInstance.getCellMeta(row, targetCol);
        if (!targetCellMeta.valid) {
          hotInstance.setCellMeta(row, targetCol, 'valid', true);
          commentsPlugin.removeCommentAtCell(targetCellMeta.row, targetCellMeta.col);
        }
      } else {
        // 開始時刻と終了時刻の関係がおかしい
        // 実績、済をクリアする
        hotInstance.setDataAtRowProp(row, 'actually', '');
        hotInstance.setDataAtRowProp(row, 'done', false);
        // ヴァリデーションエラーを追加する処理
        const cellMeta = hotInstance.getCellMeta(row, col);
        if (cellMeta.valid) {
          hotInstance.setCellMeta(row, col, 'valid', false);
          commentsPlugin.setCommentAtCell(row, col, '開始時刻に対して終了時刻が不正です。');
          commentsPlugin.showAtCell(row, col);
        }
      }
    }
  } else if (prop === 'estimate' || prop === 'actually') {
    // 変更したセルが見積 or 実績の場合、実績のメタ情報を変更する処理
    // 見積もりに対して実績がオーバーしていれば編集したセルにoverdueという属性をtrueにする
    // 見積もりに対して実績がむしろマイナスだった場合はoverdueをfalseにする
    const estimateVal = hotInstance.getDataAtRowProp(row, 'estimate');
    const actuallyVal = hotInstance.getDataAtRowProp(row, 'actually');
    if (estimateVal === '' || actuallyVal === '') return;
    if (!Number.isInteger(+estimateVal) && !Number.isInteger(+actuallyVal)) return;
    const overdueSign = Math.sign(actuallyVal - estimateVal);
    let overdue;
    if (overdueSign === 1) {
      overdue = true;
    } else if (overdueSign === -1) {
      overdue = false;
    }
    hotInstance.setCellMeta(row, hotInstance.propToCol('actually'), 'overdue', overdue);
    hotInstance.render();
  }
};

const manageNotification = (hotInstance, row, prop, newVal) => {
  // ブラウザ通知をサポートしていなければ処理を抜ける
  if (!('Notification' in window && Notification)) return;
  const col = hotInstance.propToCol(prop);
  if (prop === 'startTime') {
    // 新しい値が空の場合は既に登録されている通知を削除
    if (newVal === '') {
      const notification = hotInstance.getCellMeta(row, col).notification;
      if (notification) {
        clearTimeout(notification.id);
        hotInstance.removeCellMeta(row, col, 'notification');
        hotInstance.render();
        return;
      }
    }

    const estimateVal = hotInstance.getDataAtRowProp(row, 'estimate');
    const notifiMoment = moment(newVal, 'HH:mm').add(estimateVal, 'minutes');
    // 終了予定時刻が不正
    // もしくは見積もり時刻が空か0
    // もしくは開始時刻がヴァリデーションエラーもしくは見積もり時間が不正な場合は処理を抜ける
    if (!notifiMoment.isValid() ||
      estimateVal === '' || estimateVal === 0 ||
    !hotInstance.getCellMeta(row, col).valid || !Number.isInteger(+estimateVal)) {
      return;
    }

    // 権限を取得し通知を登録
    Notification
      .requestPermission()
      .then(() => {
        // 既に設定されているタイマーを削除
        hotInstance.removeCellMeta(row, col, 'notification');
        // タイマーを登録(セルにタイマーIDを設定)
        const notifiId = setTimeout(() => {
          // タイマーが削除されていた場合には何もしない
          if (!hotInstance.getCellMeta(row, col).notification) return;
          hotInstance.removeCellMeta(row, col, 'notification');
          const taskTitle = hotInstance.getDataAtRowProp(row, 'title');
          const notifi = new Notification(taskTitle ? `${taskTitle}の終了時刻です。` : 'タスクの終了時刻です。', {
            body: 'クリックしてタスクに終了時刻を入力し完了させてください。',
            icon: `${window.location.href}favicon.ico`,
          });
          notifi.onclick = () => {
            notifi.close();
            window.focus();
            hotInstance.selectCell(row, hotInstance.propToCol('endTime'));
          };
          // クリックされなければ5分後に消す
          setTimeout(notifi.close.bind(notifi), 300000);
          hotInstance.render();
        }, notifiMoment.toDate().getTime() - Date.now());
        hotInstance.setCellMeta(row, col, 'notification', { id: notifiId, time: notifiMoment.format('HH:mm') });
        hotInstance.render();
      });
  } else if (prop === 'endTime') {
    // startTimeのセルにタイマーIDがあれば確認をして削除
    const startTimeCol = hotInstance.propToCol('startTime');
    const notification = hotInstance.getCellMeta(row, startTimeCol).notification;
    if (notification) {
      clearTimeout(notification.id);
      hotInstance.removeCellMeta(row, startTimeCol, 'notification');
      hotInstance.render();
    }
  }
};
export const bindShortcut = (hot) => {
  // ショートカット処理
  hot.addHook('afterDocumentKeyDown', (e) => {
    // ハンズオンテーブル以外のキーダウンイベントでは下記の処理をしない
    if (e.path[0].id !== 'HandsontableCopyPaste') return;
    e.preventDefault();
    const [startRow, startCol, endRow, endCol] = hot.getSelected();
    if ((prevKey === 'Control' && e.key === ';') || (prevPrevKey === 'Control' && prevKey === 'Shift' && e.key === ':')) {
      // 現在時刻を入力
      const prop = hot.colToProp(startCol);
      // 選択しているセルが1つかつ、開始時刻・終了時刻のカラム
      if (startRow === endRow && startCol === endCol && (prop === 'endTime' || prop === 'startTime')) {
        hot.setDataAtCell(startRow, startCol, moment().format('HH:mm'));
      }
    }
    prevPrevKey = prevKey;
    prevKey = e.key;
    hot.render();
  });
};
export const emptyHotData = [cloneDeep(dataSchema)];
export const hotConf = {
  stretchH: 'all',
  comments: true,
  rowHeaders: true,
  autoInsertRow: false,
  manualRowMove: true,
  minRows: 10,
  colWidths: Math.round(constants.APPWIDTH / columns.length),
  columns,
  data: emptyHotData,
  dataSchema,
  contextMenu: {
    callback(key) {
      if (key === 'set_current_time') {
        const [row, col] = this.getSelected();
        this.setDataAtCell(row, col, moment().format('HH:mm'));
      }
    },
    items: {
      set_current_time: {
        name: '現在時刻を入力する',
        disabled() {
          const [startRow, startCol, endRow, endCol] = this.getSelected();
          const prop = this.colToProp(startCol);
          return startRow !== endRow || startCol !== endCol || !(prop === 'endTime' || prop === 'startTime');
        },
      },
      hsep1: '---------',
      row_above: {
        name: '上に行を追加する',
      },
      row_below: {
        name: '下に行を追加する',
      },
      hsep2: '---------',
      remove_row: {
        name: '行を削除する',
        disabled() {
          return this.getSelected()[0] === 0;
        },
      },
    },
  },
  afterValidate(isValid, value, row, prop) {
    setValidtionMessage(this, row, prop, isValid);
  },
  afterChange(changes) {
    if (!changes) return;
    changes.forEach((change) => {
      const [row, prop, oldVal, newVal] = change;
      if (oldVal !== newVal) {
        calculateTask(this, row, prop);
        manageNotification(this, row, prop, newVal);
      }
    });
  },
};
