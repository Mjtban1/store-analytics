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
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const messaging = getMessaging();
            
            // استخدام المفتاح الجديد VAPID
            const token = await getToken(messaging, {
                vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
            });
            
            await saveTokenToFirebase(token);
            setupForegroundNotifications(messaging);
            startPeriodicNotifications();
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

const saveTokenToFirebase = async (token) => {
    try {
        const tokensRef = collection(db, 'tokens');
        await addDoc(tokensRef, {
            token,
            timestamp: new Date(),
            platform: 'web'
        });
    } catch (error) {
        console.error('Error saving token:', error);
    }
};

const setupForegroundNotifications = (messaging) => {
    onMessage(messaging, (payload) => {
        new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: '/favicon.png'
        });
    });
};

export const startPeriodicNotifications = () => {
    setInterval(() => {
        const notification = notifications[Math.floor(Math.random() * notifications.length)];
        new Notification('تذكير من المتجر', {
            body: notification.text,
            icon: '/favicon.png',
            badge: '/favicon.png',
            tag: 'store-reminder'
        });
    }, 60000); // Every minute
};
