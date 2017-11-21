export default {
    stretchH: "all",
    rowHeaders: true,
    manualRowMove: true,
    colWidths: Math.round(window.innerWidth / 9),
    columns: [
      {
        title: "済",
        data: "done",
        type: "checkbox",
        colWidths: 30,
        readOnly: true,
        className: "htCenter htMiddle"
      },
      {
        title: "カテゴリ",
        data: "category",
        type: "text"
      },
      {
        title: "タイトル",
        data: "title",
        type: "text"
      },
      {
        title: "見積(分)",
        data: "estimate",
        type: "numeric"
      },
      {
        title: "実績(分)",
        data: "actually",
        type: "numeric",
        readOnly: true
      },
      {
        title: "開始時刻",
        type: "time",
        timeFormat: "hh:mm a",
        correctFormat: true
      },
      {
        title: "終了時刻",
        type: "time",
        timeFormat: "hh:mm a",
        correctFormat: true
      },
      {
        title: "備考",
        type: "text"
      },
      {
        title: "感想",
        type: "text"
      }
    ]
  }
