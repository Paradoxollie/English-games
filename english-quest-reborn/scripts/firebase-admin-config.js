/**
 * Configuration Firebase pour Node.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAm_fvXFh9Iv1EkoCJniaLkmXOelC6CRv0',
  authDomain: 'english-games-41017.firebaseapp.com',
  projectId: 'english-games-41017',
  storageBucket: 'english-games-41017.appspot.com',
  messagingSenderId: '452279652544',
  appId: '1:452279652544:web:1234567890abcdef'
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db }; 