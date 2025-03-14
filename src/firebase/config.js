// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAuth, signInAnonymously } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);

export const initializeMessaging = async () => {
  try {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    // Wait for service worker registration
    const registration = await navigator.serviceWorker.ready;
    
    const messaging = getMessaging();
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (!currentToken) {
      throw new Error('No registration token available');
    }

    // Save the token to Firestore
    const auth = getAuth();
    const tokensRef = collection(db, 'fcm_tokens');
    await addDoc(tokensRef, {
      token: currentToken,
      uid: auth.currentUser?.uid || 'anonymous',
      createdAt: new Date(),
      platform: 'web'
    });

    return currentToken;
  } catch (error) {
    console.error('Error getting token:', error);
    throw error;
  }
};

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Permission not granted');
    }

    const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;
    const messaging = getMessaging();
    
    const currentToken = await getToken(messaging, { vapidKey });
    
    if (currentToken) {
      await saveTokenToDatabase(currentToken);
      console.log('FCM token:', currentToken);
      return currentToken;
    } else {
      throw new Error('No token available');
    }
  } catch (error) {
    console.error('Error getting token:', error);
    throw error;
  }
};

const saveTokenToDatabase = async (token) => {
  try {
    const auth = getAuth();
    const uid = auth.currentUser?.uid || 'anonymous';
    
    const tokensRef = collection(db, 'fcm_tokens');
    await addDoc(tokensRef, {
      token,
      uid,
      createdAt: new Date(),
      deviceType: 'web'
    });
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export const sendNotification = async (title, body) => {
  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${process.env.REACT_APP_FIREBASE_SERVER_KEY}`
      },
      body: JSON.stringify({
        to: await getToken(messaging),
        notification: {
          title,
          body,
          icon: '/favicon.png',
          click_action: window.location.origin
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};