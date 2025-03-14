self.addEventListener('install', event => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            // Clear any old caches
            caches.keys().then(keys => Promise.all(
                keys.map(key => caches.delete(key))
            ))
        ])
    );
});

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

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

    const { title, body, icon } = payload.notification;

    const notificationOptions = {
        body: body,
        icon: icon || '/favicon.png',
        badge: '/favicon.png',
        tag: 'notification',
        vibrate: [200, 100, 200],
        data: payload.data,
        actions: [
            {
                action: 'open',
                title: 'فتح'
            },
            {
                action: 'close',
                title: 'إغلاق'
            }
        ],
        requireInteraction: true
    };

    return self.registration.showNotification(title, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event);
    
    event.notification.close();
    
    if (event.action === 'open') {
        clients.openWindow('/');
    }
});
