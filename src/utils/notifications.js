import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

const notifications = [
    { text: "📝 لا تنسى تسجيل طلبات اليوم!", emoji: "📊" },
    { text: "💰 هل قمت بترتيب سجلات المبيعات؟", emoji: "📈" },
    { text: "🎯 تذكير: تسهيل وترتيب الطلبات", emoji: "✨" },
    { text: "💼 لا تنسى مراجعة الحسابات اليومية", emoji: "📋" },
    { text: "📌 تحقق من المخزون وسجل الطلبيات", emoji: "🔍" }
];

export const requestNotificationPermission = async () => {
    try {
        if (!('serviceWorker' in navigator)) {
            console.error('Service Worker not supported');
            return;
        }

        await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const messaging = getMessaging();
            
            const currentToken = await getToken(messaging, {
                vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
                serviceWorkerRegistration: await navigator.serviceWorker.ready
            });
            
            if (currentToken) {
                console.log('FCM Token:', currentToken);
                await saveTokenToFirebase(currentToken);
                setupForegroundNotifications(messaging);
                startPeriodicNotifications();
            } else {
                console.error('No token received');
            }
        }
    } catch (error) {
        console.error('Notification setup error:', error);
    }
};

const saveTokenToFirebase = async (token) => {
    try {
        const tokensRef = collection(db, 'notification_tokens');
        await addDoc(tokensRef, {
            token,
            createdAt: new Date(),
            platform: 'web',
            isActive: true
        });
    } catch (error) {
        console.error('Error saving token:', error);
    }
};

const setupForegroundNotifications = (messaging) => {
    onMessage(messaging, (payload) => {
        console.log('Received foreground message:', payload);
        showNotification(payload.notification);
    });
};

const showNotification = (notificationData) => {
    const { title, body } = notificationData;
    new Notification(title, {
        body,
        icon: '/favicon.png',
        badge: '/favicon.png',
        vibrate: [200, 100, 200],
        tag: 'store-notification'
    });
};

// تم تعديل الفترة الزمنية لتكون أطول
export const startPeriodicNotifications = () => {
    setInterval(() => {
        const notification = notifications[Math.floor(Math.random() * notifications.length)];
        showNotification({
            title: 'تذكير من المتجر',
            body: notification.text
        });
    }, 300000); // كل 5 دقائق بدلاً من كل دقيقة
};
