/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line import/no-extraneous-dependencies
import { initializeApp } from '@firebase/app';
import { getFirestore } from '@firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDR2mk7hT8h2GHyqXGxYXr8ThC3cmgyFYo',
  authDomain: 'covey-fishing.firebaseapp.com',
  projectId: 'covey-fishing',
  storageBucket: 'covey-fishing.appspot.com',
  messagingSenderId: '863031452518',
  appId: '1:863031452518:web:bf86c89240e0f0a294dea7',
  measurementId: 'G-ZLDHB5Y32R',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
