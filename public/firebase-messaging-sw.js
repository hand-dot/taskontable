// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/onnotificationclick
// 上記を参考に下記では無駄にウインドウを開きたくない
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({
    type: 'window',
  }).then((clientList) => {
    for (let i = 0; i < clientList.length; i++) {
      const client = clientList[i];
      if (client.url === event.notification.data.url && 'focus' in client) { return client.focus(); }
    }
    if (clients.openWindow) { return clients.openWindow(event.notification.data.url); }
  }));
});
importScripts('https://www.gstatic.com/firebasejs/5.0.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.0.2/firebase-messaging.js');
firebase.initializeApp({ messagingSenderId: '27989839492' });
const messaging = firebase.messaging();
messaging.setBackgroundMessageHandler(payload => self.registration.showNotification(payload.data.title, { icon: payload.data.icon, body: payload.data.body, data: { url: payload.data.url } }));
