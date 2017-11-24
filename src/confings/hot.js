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
  },
  {
    title: '開始時刻',
    type: 'time',
    timeFormat: 'HH:mm',
    correctFormat: true,
  },
  {
    title: '終了時刻',
    type: 'time',
    timeFormat: 'HH:mm',
    correctFormat: true,
  },
  {
    title: '備考',
    type: 'text',
  },
  {
    title: '感想',
    type: 'text',
  },
  {
    title: '実績(分)',
    data: 'actually',
    type: 'numeric',
    readOnly: true,
  },
];
export default {
  stretchH: 'all',
  comments: true,
  rowHeaders: true,
  manualRowMove: true,
  colWidths: Math.round(window.innerWidth / 9),
  columns,
  cell: [
    { row: 0, col: columns.findIndex(element => element.data === 'done'), comment: { value: '終了時刻を記入後、自動入力されます。' } },
    { row: 0, col: columns.findIndex(element => element.data === 'actually'), comment: { value: '終了時刻を記入後、自動入力されます。' } },
  ],
  afterValidate(isValid, value, row, prop) {
    const commentsPlugin = this.getPlugin('comments');
    const col = this.propToCol(prop);
    if (isValid) {
      commentsPlugin.removeCommentAtCell(row, col);
    } else {
      const type = columns[col].type;
      let comment;
      if (type === 'numeric') {
        comment = '半角数値で入力してください';
      } else if (type === 'time') {
        comment = '半角カンマ区切りで有効な時刻を入力してください';
      }
      commentsPlugin.setCommentAtCell(row, col, comment);
      commentsPlugin.showAtCell(row, col);
    }
  },
};
