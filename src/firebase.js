// src/firebase.js
// Firebase configuration for OLOS (Online Lost and Found System)
// Replace the config values below with your actual Firebase project credentials.
// Steps:
//   1. Go to https://console.firebase.google.com
//   2. Create a project named "OLOS" (or any name)
//   3. Add a Web App, copy the firebaseConfig object here
//   4. Enable Authentication > Email/Password sign-in
//   5. Create Firestore Database (start in test mode for development)
//   6. Enable Storage

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyD3Ipq-MQkIexcz4sekqRXyNQxdRGxo76g",
  authDomain: "olos-f17ea.firebaseapp.com",
  projectId: "olos-f17ea",
  storageBucket: "olos-f17ea.firebasestorage.app",
  messagingSenderId: "98088266828",
  appId: "1:98088266828:web:c7ba1b4e7d5e9c214998e9",
  measurementId: "G-ZM5TDER9PW"
};

const app = initializeApp(firebaseConfig)

// Firebase services used by OLOS
export const auth = getAuth(app)         // Authentication
export const db = getFirestore(app)      // Cloud Firestore (database)
export const storage = getStorage(app)   // Cloud Storage (images)

export default app
