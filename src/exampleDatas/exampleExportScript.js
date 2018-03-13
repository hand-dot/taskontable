/* eslint no-param-reassign: ["error", { "props": false }] */
export default function exportScript(e) {
  const YOUR_TOKEN = 'YourPersonalAccessTokens';
  e.data.forEach((data) => {
    if (data.title.startsWith('@github ')) {
      const URL = `${data.memo.replace(/github.com/i, 'api.github.com/repos')}?access_token=${YOUR_TOKEN}`;
      const state = data.startTime && data.endTime ? 'closed' : 'open';
      fetch(URL, { method: 'PATCH', body: JSON.stringify({ state }) });
    }
  });
  postMessage(e.data);
}
