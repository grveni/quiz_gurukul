//import firebase from 'firebase/app';
//import 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBjT33_8ldHi2XTiU-xGWUdCYNSJBowKHg',
  authDomain: 'gurukul-quiz-veni.firebaseapp.com',
  projectId: 'gurukul-quiz-veni',
  storageBucket: 'gurukul-quiz-veni.appspot.com',
  messagingSenderId: '1013285495311',
  appId: '1:1013285495311:web:058e4a0a779699ad57397a',
  measurementId: 'G-8SY8MY4S1Y',
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
