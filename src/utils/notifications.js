import { messaging, requestNotificationPermission, onMessageListener } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { getMessaging, onMessage, getToken } from "firebase/messaging";
import { getAuth, signInAnonymously } from "firebase/auth";
import { db } from '../firebase/config';

const notifications = [
    { text: "📝 لا تنسى تسجيل طلبات اليوم!", emoji: "📊" },
    { text: "💰 هل قمت بترتيب سجلات المبيعات؟", emoji: "📈" },
    { text: "🎯 تذكير: تسهيل وترتيب الطلبات", emoji: "✨" },
    { text: "💼 لا تنسى مراجعة الحسابات اليومية", emoji: "📋" },
    { text: "📌 تحقق من المخزون وسجل الطلبيات", emoji: "🔍" }
];

export const initializeNotifications = async () => {
    try {
        if (!('Notification' in window)) {
            throw new Error('This browser does not support notifications');
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            throw new Error('Permission not granted');
        }

        const messaging = getMessaging();
        const registration = await navigator.serviceWorker.ready;
        
        const currentToken = await getToken(messaging, {
            vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration
        });

        if (currentToken) {
            await saveTokenToFirebase(currentToken);
            setupForegroundListener();
            startPeriodicNotifications();
        }
    } catch (error) {
        console.error('Error initializing notifications:', error);
    }
};

const saveTokenToFirebase = async (token) => {
    try {
        const auth = getAuth();
        const tokensRef = collection(db, 'notification_tokens');
        await addDoc(tokensRef, {
            token,
            uid: auth.currentUser.uid,
            createdAt: new Date(),
            platform: 'web',
            isActive: true
        });
    } catch (error) {
        console.error('Error saving token:', error);
    }
};

const setupForegroundListener = () => {
    onMessageListener()
        .then(payload => {
            console.log('Received foreground message:', payload);
            showNotification(payload.notification);
        })
        .catch(err => console.error('Error:', err));
};

const showNotification = ({ title, body }) => {
    new Notification(title, {
        body,
        icon: '/favicon.png',
        badge: '/favicon.png',
        vibrate: [200, 100, 200],
        tag: 'notification'
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
