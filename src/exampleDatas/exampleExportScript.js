/* eslint no-param-reassign: ["error", { "props": false }] */
export default function exportScript(e) {
  e.data.forEach((data) => {
    data.title += '!';
  });
  postMessage(e.data);
}
