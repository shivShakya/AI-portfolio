import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAPK1JOK7-i_HsqOvzJ8zb6a9CN0VjMA3k",
  authDomain: "portfolio-97f8e.firebaseapp.com",
  projectId: "portfolio-97f8e",
  storageBucket: "portfolio-97f8e.firebasestorage.app",
  messagingSenderId: "30742816783",
  appId: "1:30742816783:web:d7bf7f1d01c80d235b5b7a",
  measurementId: "G-63STCVBN6V"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

