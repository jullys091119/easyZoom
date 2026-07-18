// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCH16u6a7IRgmnOxmkf01sfwvT3-WxBLYE",
  authDomain: "easyzoom-1b0d4.firebaseapp.com",
  projectId: "easyzoom-1b0d4",
  storageBucket: "easyzoom-1b0d4.firebasestorage.app",
  messagingSenderId: "1023707100852",
  appId: "1:1023707100852:web:ee8a6c4bed2a6796dc09e1",
  measurementId: "G-TWSQF37W2Y"
};


const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

export const db = getFirestore(app);

export default app;