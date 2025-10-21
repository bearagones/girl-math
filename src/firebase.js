import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyBrX2_Kz-22qRlM5Rz-PC9yDVGxgr5Gq7M",
    authDomain: "girl-math-64fcf.firebaseapp.com",
    projectId: "girl-math-64fcf",
    storageBucket: "girl-math-64fcf.firebasestorage.app",
    messagingSenderId: "618214011459",
    appId: "1:618214011459:web:215740629e9f0878055af6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export { database };
