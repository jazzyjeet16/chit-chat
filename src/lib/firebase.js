// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBnSpSWPyzm-CIN3EmrErr4xMOHgUY8Cxs",
  authDomain: "chit-chat-fc16b.firebaseapp.com",
  projectId: "chit-chat-fc16b",
  storageBucket: "chit-chat-fc16b.appspot.com",
  messagingSenderId: "474975198079",
  appId: "1:474975198079:web:6287a43745c04c461ed84a",
  measurementId: "G-N8P9VHEXZ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const Auth=getAuth();
export const db=getFirestore();
export const storage=getStorage();