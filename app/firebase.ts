// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from 'firebase/analytics';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "resume-ready-ed4a2.firebaseapp.com",
  projectId: "resume-ready-ed4a2",
  storageBucket: "resume-ready-ed4a2.appspot.com",
  messagingSenderId: "646741990826",
  appId: "1:646741990826:web:10a72ff4995025ca66dfd3",
  measurementId: "G-43J7DHDBYY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let analytics: any;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}


export { db, analytics };