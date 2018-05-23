// タブに通知が送られたURLがあればフォーカスする。なければ開く。
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clientList) => {
    for (let i = 0; i < clientList.length; i += 1) {
      const client = clientList[i];
      if (client.url === event.notification.data.url && 'focus' in client) return client.focus();
    }
    if (clients.openWindow) { return clients.openWindow(event.notification.data.url); }
  }));
});

importScripts('https://www.gstatic.com/firebasejs/5.0.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.0.2/firebase-messaging.js');
importScripts('https://cdnjs.cloudflare.com/ajax/libs/localforage/1.7.1/localforage.min.js');

firebase.initializeApp({ messagingSenderId: '27989839492' });
const messaging = firebase.messaging();
messaging.setBackgroundMessageHandler((payload) => {
  // バックグラウンドで通知を受け取ったらlocalforageに保存
  localforage.setItem(`recentMessage.${new URL(payload.data.url).pathname.replace('/', '')}`, { icon: payload.data.icon, body: payload.data.body });
  self.registration.showNotification(payload.data.title, { icon: payload.data.icon, body: payload.data.body, data: { url: payload.data.url } });
});
