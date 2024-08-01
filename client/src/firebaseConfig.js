// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOj4HgDa4dHhboPOCqrTgUOdSx1ooSzYA",
  authDomain: "convy-a06d9.firebaseapp.com",
  projectId: "convy-a06d9",
  storageBucket: "convy-a06d9.appspot.com",
  messagingSenderId: "177776972521",
  appId: "1:177776972521:web:0edbb8c82c74f984751678"
};
// const firebaseConfig = {
//   apiKey: "",
//   authDomain: "",
//   projectId: "",
//   storageBucket: "",
//   messagingSenderId: "",
//   appId: ""
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const fb_auth = getAuth(app);
const storage = getStorage(app)

export { db, fb_auth, storage };
