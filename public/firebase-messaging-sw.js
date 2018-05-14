importScripts('https://www.gstatic.com/firebasejs/5.0.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.0.2/firebase-messaging.js');
firebase.initializeApp({
  messagingSenderId: '27989839492',
});
const messaging = firebase.messaging();
