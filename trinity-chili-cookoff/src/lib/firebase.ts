// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVEsFeF2Aw0pTL3eYAYkZ-6bJxXkmLszU",
  authDomain: "trinity-chili-cook-off.firebaseapp.com",
  projectId: "trinity-chili-cook-off",
  storageBucket: "trinity-chili-cook-off.firebasestorage.app",
  messagingSenderId: "444280568515",
  appId: "1:444280568515:web:d33a50c11afbee06ce8076"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
