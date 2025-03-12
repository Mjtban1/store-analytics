importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

self.addEventListener('install', event => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(clients.claim()));

firebase.initializeApp({
  apiKey: "AIzaSyBwTFRLvXDLLmrj5MfnXhR4KZW0JQdau3w",
  authDomain: "app-anylasis.firebaseapp.com",
  projectId: "app-anylasis",
  storageBucket: "app-anylasis.appspot.com",
  messagingSenderId: "302260206820",
  appId: "1:302260206820:web:8fbf734cacb3be3dd400f1"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: 'store-notification',
    data: payload.data
  };

  return self.registration.showNotification(
    payload.notification.title,
    notificationOptions
  );
});
