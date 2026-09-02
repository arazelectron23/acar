import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB3fQLSwBzd9csY9cjgTMGih5SelP2N0-o",
    authDomain: "acar-bff2f.firebaseapp.com",
    projectId: "acar-bff2f",
    storageBucket: "acar-bff2f.appspot.com", // Düzgün format
    messagingSenderId: "258458444623",
    appId: "1:258458444623:web:c17f3954154b4adb0ddb3a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);