// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBwTFRLvXDLLmrj5MfnXhR4KZW0JQdau3w",
  authDomain: "app-anylasis.firebaseapp.com",
  projectId: "app-anylasis",
  storageBucket: "app-anylasis.appspot.com",
  messagingSenderId: "302260206820",
  appId: "1:302260206820:web:8fbf734cacb3be3dd400f1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const messaging = getMessaging(app);