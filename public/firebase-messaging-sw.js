importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBwTFRLvXDLLmrj5MfnXhR4KZW0JQdau3w",
  authDomain: "app-anylasis.firebaseapp.com",
  projectId: "app-anylasis",
  storageBucket: "app-anylasis.appspot.com",
  messagingSenderId: "302260206820",
  appId: "1:302260206820:web:8fbf734cacb3be3dd400f1"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

self.addEventListener('install', event => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(clients.claim()));

messaging.onBackgroundMessage((payload) => {
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.png',
    tag: 'store-notification'
  };

  return self.registration.showNotification(payload.notification.title, notificationOptions);
});
