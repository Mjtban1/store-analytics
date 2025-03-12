importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBwTFRLvXDLLmrj5MfnXhR4KZW0JQdau3w",
  authDomain: "app-anylasis.firebaseapp.com",
  projectId: "app-anylasis",
  messagingSenderId: "302260206820",
  appId: "1:302260206820:web:8fbf734cacb3be3dd400f1"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.png',
    badge: '/favicon.png',
    vibrate: [200, 100, 200],
    tag: 'store-notification'
  };

  self.registration.showNotification(
    payload.notification.title,
    notificationOptions
  );
});
