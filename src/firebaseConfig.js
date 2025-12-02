// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8dMJgOegSP48HtnVFmI0F0TIV-7lJNrk",
  authDomain: "sample1-ee242.firebaseapp.com",
  projectId: "sample1-ee242",
  storageBucket: "sample1-ee242.firebasestorage.app",
  messagingSenderId: "111483679952",
  appId: "1:111483679952:web:732df535c9c099231bdad5",
  measurementId: "G-J60EGT96NN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export default app;