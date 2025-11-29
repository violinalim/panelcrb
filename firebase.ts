import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXJgrVBEjP1o7EWRdvzLI49I7ELKVjV20",
  authDomain: "crbklasemen.firebaseapp.com",
  projectId: "crbklasemen",
  storageBucket: "crbklasemen.firebasestorage.app",
  messagingSenderId: "142280769130",
  appId: "1:142280769130:web:43c461a4033cd683011413",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
