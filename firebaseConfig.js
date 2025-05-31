// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCSzCHlHivf1kk77F05ZelTuf1uRjz18ds",
  authDomain: "smarttunnelhs.firebaseapp.com",
  databaseURL: "https://smarttunnelhs-default-rtdb.firebaseio.com",
  projectId: "smarttunnelhs",
  storageBucket: "smarttunnelhs.appspot.com",
  messagingSenderId: "157678080005",
  appId: "1:157678080005:android:d07757918048b7bbb9c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
