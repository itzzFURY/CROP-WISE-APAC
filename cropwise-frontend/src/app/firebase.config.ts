
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyAde_iceQ2kl0829uazBPt36e5EtkCj-o0",
  authDomain: "crop-wise-2407a.firebaseapp.com",
  databaseURL: "https://crop-wise-2407a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "crop-wise-2407a",
  storageBucket: "crop-wise-2407a.firebasestorage.app",
  messagingSenderId: "20182939470",
  appId: "1:20182939470:web:3991a5d138fb38cd2a101f",
  measurementId: "G-KZ7MD51VJ9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);