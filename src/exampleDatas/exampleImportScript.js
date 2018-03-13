/* eslint no-param-reassign: ["error", { "props": false }] */
export default function importScript(e) {
  const YOUR_TOKEN = 'YourPersonalAccessTokens';
  const YOUR_URL = `https://api.github.com/repos/hand-dot/taskontable/issues?state=open&labels=Status%3A+progress&access_token=${YOUR_TOKEN}`;
  fetch(YOUR_URL).then(res => res.json()).then((datas) => {
    const issues = datas.map(data => ({ id: data.id.toString(), title: `@github ${data.title}`, estimate: '', startTime: '', endTime: '', memo: `https://github.com/hand-dot/taskontable/issues/${data.number}` }));
    const tasksIds = Array.from(new Set(e.data.map(task => task.id)));
    postMessage(e.data.concat(issues.filter(data => !tasksIds.includes(data.id))));
  });
}
