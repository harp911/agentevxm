import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBZG9SwpCWru6XQTs_1I1yEeYczZDDIGww",
  authDomain: "agentevxm.firebaseapp.com",
  projectId: "agentevxm",
  storageBucket: "agentevxm.firebasestorage.app",
  messagingSenderId: "920130073638",
  appId: "1:920130073638:web:19fd42dad107f05a8522e7",
  measurementId: "G-6HL6XS4YT3"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
