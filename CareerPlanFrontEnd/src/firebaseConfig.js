// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkyzXUXPS401DE_6i7OIRXJF4W7ZXOc-A",
  authDomain: "careerplan-d4575.firebaseapp.com",
  projectId: "careerplan-d4575",
  storageBucket: "careerplan-d4575.firebasestorage.app",
  messagingSenderId: "416923124537",
  appId: "1:416923124537:web:abb6f54e6c76e126b3dee8",
  measurementId: "G-CB9RBJXZP0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);