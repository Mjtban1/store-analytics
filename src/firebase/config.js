// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBwTFRLvXDLLmrj5MfnXhR4KZW0JQdau3w",
  authDomain: "app-anylasis.firebaseapp.com",
  projectId: "app-anylasis",
  storageBucket: "app-anylasis.firebasestorage.app",
  messagingSenderId: "302260206820",
  appId: "1:302260206820:web:8fbf734cacb3be3dd400f1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);

export const initializeMessaging = async () => {
  try {
    if (!messaging) return null;
    
    return await getToken(messaging, {
      vapidKey: "BDTRHVNh79l2aOcP6-XP9OHbaf3f5Kmhox553KAwOknFhLTfQsPlhuiysJhmUeFYn62AnocqPcDiSwdJ4kmosVo"
    });
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};