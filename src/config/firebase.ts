/**
 * Firebase configuration
 *
 * Steps to fill this in:
 *  1. Go to https://console.firebase.google.com
 *  2. Create a new project called "gk-stats" (or any name)
 *  3. Add a Web App to the project (</> icon on the project overview page)
 *  4. Copy the firebaseConfig values below
 *  5. In the Firebase console, enable:
 *     - Authentication → Sign-in method → Email/Password
 *     - Firestore Database → Create database (start in production mode)
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.projectId);
}

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
db = getFirestore(app);

export { auth, db };
