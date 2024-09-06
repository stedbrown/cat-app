import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBDq-0QiKskRY_etJ_w2B3iE7IXe1mDY9Y",
    authDomain: "appcat-b8eaf.firebaseapp.com",
    projectId: "appcat-b8eaf",
    storageBucket: "appcat-b8eaf.appspot.com",
    messagingSenderId: "784870832083",
    appId: "1:784870832083:web:8efbd6df754eed7db4a126"
  };

  const app = initializeApp(firebaseConfig);

  export const auth = getAuth(app);
  export const firestore = getFirestore(app);