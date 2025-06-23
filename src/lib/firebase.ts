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
let connectionError: string | null = null;

const requiredKeys: (keyof typeof firebaseConfig)[] = [
  'apiKey', 
  'authDomain', 
  'projectId', 
  'storageBucket', 
  'messagingSenderId', 
  'appId'
];

const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  const envVarNames = missingKeys.map(k => `NEXT_PUBLIC_FIREBASE_${k.replace(/([A-Z])/g, '_$1').toUpperCase()}`);
  const errorMessage = `Firebase configuration is missing. Please add the following to your .env.local file: ${envVarNames.join(', ')}`;
  console.warn(errorMessage);
  connectionError = errorMessage;
} else {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
  } catch (e: any) {
    connectionError = `Firebase initialization failed: ${e.message}`;
    console.error(connectionError, e);
  }
}

export { db, connectionError };
