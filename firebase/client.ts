import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0hirJWzXbT18VXAwEYcFPL0yYT_sfOdg",
  authDomain: "prepora-789dc.firebaseapp.com",
  projectId: "prepora-789dc",
  storageBucket: "prepora-789dc.firebasestorage.app",
  messagingSenderId: "755509343188",
  appId: "1:755509343188:web:a4b121d286422065049c41",
  measurementId: "G-4EZQYE5BXG",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Ensure named exports are available
export default {
  auth,
  db,
};
