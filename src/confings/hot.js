import moment from 'moment';

const columns = [
  {
    title: '済',
    data: 'done',
    type: 'checkbox',
    colWidths: 30,
    readOnly: true,
    className: 'htCenter htMiddle',
  },
  {
    title: 'カテゴリ',
    data: 'category',
    type: 'text',
    colWidths: 100,
  },
  {
    title: 'タイトル',
    data: 'title',
    type: 'text',
  },
  {
    title: '見積(分)',
    data: 'estimate',
    type: 'numeric',
    colWidths: 60,
  },
  {
    title: '開始時刻',
    data: 'startTime',
    type: 'time',
    colWidths: 60,
    timeFormat: 'HH:mm',
    correctFormat: true,
  },
  {
    title: '終了時刻',
    data: 'endTime',
    type: 'time',
    colWidths: 60,
    timeFormat: 'HH:mm',
    correctFormat: true,
  },
  {
    title: '実績(分)',
    data: 'actually',
    type: 'numeric',
    colWidths: 60,
    readOnly: true,
  },
  {
    title: '備考',
    type: 'text',
  },
  {
    title: '感想',
    type: 'text',
  },
];

const doneColIndex = columns.findIndex(col => col.data === 'done');
const actuallyColIndex = columns.findIndex(col => col.data === 'actually');
const startTimeColIndex = columns.findIndex(col => col.data === 'startTime');
const endTimeColIndex = columns.findIndex(col => col.data === 'endTime');

export default {
  stretchH: 'all',
  comments: true,
  rowHeaders: true,
  manualRowMove: true,
  colWidths: Math.round(window.innerWidth / 9),
  columns,
  cell: [
    {
      row: 0,
      col: doneColIndex,
      comment: { value: '終了時刻を記入後、自動入力されます。' },
    },
    {
      row: 0,
      col: actuallyColIndex,
      comment: { value: '終了時刻を記入後、自動入力されます。' },
    },
  ],
  afterValidate(isValid, value, row, prop) {
    const commentsPlugin = this.getPlugin('comments');
    const col = this.propToCol(prop);
    if (isValid) {
      commentsPlugin.removeCommentAtCell(row, col);
    } else {
      const type = columns[col].type;
      let comment = '';
      if (type === 'numeric') {
        comment = '半角数値で入力してください';
      } else if (type === 'time') {
        comment = '半角数値,カンマ区切りで有効な時刻を入力してください';
      }
      commentsPlugin.setCommentAtCell(row, col, comment);
      commentsPlugin.showAtCell(row, col);
    }
  },
  afterBeginEditing(row, col) {
    if (endTimeColIndex === col &&
      (this.getDataAtCell(row, col) === null || this.getDataAtCell(row, col) === '')) {
      // 編集を始めたセルが終了時刻かつ、セルが空の場合
      const startTimeVal = this.getDataAtRowProp(row, 'startTime');
      if (startTimeVal === null || startTimeVal === '') {
        // 開始時刻が入力されていない場合開始時間を入力させる
        alert('開始時刻を入力してください');
        this.selectCell(row, startTimeColIndex);
      } else {
        // 現在時刻を入力する
        this.setDataAtCell(row, col, moment().format('HH:mm'));
      }
    } else if (startTimeColIndex === col &&
      (this.getDataAtCell(row, col) === null || this.getDataAtCell(row, col) === '')) {
      // 編集を始めたセルが開始時刻かつ、セルが空の場合、現在時刻を入力する
      this.setDataAtCell(row, col, moment().format('HH:mm'));
    }
  },
  afterChange(changes) {
    if (!changes) return;
    changes.forEach((change) => {
      const [row, prop] = [change[0], change[1]];
      const col = this.propToCol(prop);
      if (col === startTimeColIndex || col === endTimeColIndex) {
        // 変更したセルが開始時刻 or 終了時刻の場合、実績を自動入力し、済をチェックする処理
        const startTimeVal = this.getDataAtCell(row, startTimeColIndex);
        const endTimeVal = this.getDataAtCell(row, endTimeColIndex);
        if (startTimeVal === null || endTimeVal === null || startTimeVal === '' || endTimeVal === '') {
          // 入力値が空の場合、実績を空にし、済のチェックをはずす
          this.setDataAtCell(row, doneColIndex, false);
          this.setDataAtCell(row, actuallyColIndex, '');
        } else if (endTimeVal.indexOf(':') !== -1 && startTimeVal.indexOf(':') !== -1) {
          // 実績を入力し、済をチェックする処理の開始
          const [endTimeHour, endTimeMinute] = endTimeVal.split(':');
          const [startTimeHour, startTimeMinute] = startTimeVal.split(':');
          // 入力値のチェック
          if (!Number.isInteger(+endTimeHour) && !Number.isInteger(+endTimeMinute) &&
          !Number.isInteger(+startTimeHour) && !Number.isInteger(+startTimeMinute)) return;
          // 開始時刻、終了時刻が有効な値の場合
          const endTime = moment().hour(endTimeHour).minute(endTimeMinute);
          const startTime = moment().hour(startTimeHour).minute(startTimeMinute);
          const diff = endTime.diff(startTime, 'minutes');
          const commentsPlugin = this.getPlugin('comments');
          if (!isNaN(diff) && Math.sign(diff) !== -1) {
            // 実績を入力し、済をチェックする
            this.setDataAtCell(row, actuallyColIndex, diff);
            this.setDataAtCell(row, doneColIndex, true);
            // ヴァリデーションエラーを消す処理
            const targetMeta = prop === 'startTime' ? this.getCellMeta(row, endTimeColIndex) : this.getCellMeta(row, startTimeColIndex);
            if (!targetMeta.valid) {
              targetMeta.valid = true;
              commentsPlugin.removeCommentAtCell(targetMeta.row, targetMeta.col);
            }
          } else {
            // 開始時刻と終了時刻の関係がおかしい
            // 実績、済をクリアする
            this.setDataAtCell(row, actuallyColIndex, '');
            this.setDataAtCell(row, doneColIndex, false);
            // ヴァリデーションエラーを追加する処理
            const meta = this.getCellMeta(row, col);
            if (meta.valid) {
              meta.valid = false;
              commentsPlugin.setCommentAtCell(row, col, '開始時刻に対して終了時刻が不正です。');
              commentsPlugin.showAtCell(row, col);
            }
          }
        }
      } else if (col === actuallyColIndex) {
        // 見積もりに対して実績がオーバーしていれば赤文字にする
        // 見積もりに対して実績がオーバーしていなければ緑文字にする
        // 見積もりが未入力の場合、何もしな
      }
    });
  },
};
