// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB4VtqwFTJ-WToewWhs5YdLT3LCRslwP2w",
  authDomain: "calorie-cout.firebaseapp.com",
  projectId: "calorie-cout",
  storageBucket: "calorie-cout.firebasestorage.app",
  messagingSenderId: "887565914398",
  appId: "1:887565914398:web:061a9b40117a0a45f6b90f",
  measurementId: "G-FYXVZTBFVL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
export default app;