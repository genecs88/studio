import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;

// Check if the necessary Firebase config values are provided.
const configIsValid = firebaseConfig.apiKey && firebaseConfig.projectId;

if (configIsValid) {
  // Initialize Firebase only if the config is valid.
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
} else {
  // Log a warning if the config is missing.
  // This will prevent a server crash and show a clear message in the logs.
  console.warn("Firebase configuration is missing or incomplete. Please check your .env.local file. The application will not connect to the database.");
}

export { db };
