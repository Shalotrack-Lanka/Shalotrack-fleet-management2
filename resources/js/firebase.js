import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyDLhihA9YLNTKxeYu3gjvOnma-vPjsVu0w",
  authDomain: "shalotracklanka.firebaseapp.com",
  projectId: "shalotracklanka",
  storageBucket: "shalotracklanka.firebasestorage.app",
  messagingSenderId: "425166487990",
  appId: "1:425166487990:web:900e6bfca6f26c62248117",
  measurementId: "G-T4SHN985KZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);