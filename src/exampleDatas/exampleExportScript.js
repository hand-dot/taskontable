/* eslint no-param-reassign: ["error", { "props": false }] */
export default function exportScript(e) {
  const YOUR_TOKEN = 'YourPersonalAccessTokens';
  e.data.filter(data => data.title.startsWith('@github ') && data.startTime && data.endTime).forEach((data) => {
    const URL = `${data.memo.replace(/github.com/i, 'api.github.com/repos')}?access_token=${YOUR_TOKEN}`;
    fetch(URL, {
      method: 'PATCH',
      body: JSON.stringify({ state: 'closed' }),
    });
  });
  postMessage(e.data);
}
