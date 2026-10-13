import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence, getAuth, Auth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// NOTE: @react-native-google-signin/google-signin is a native module that does
// NOT exist inside Expo Go. It must never be statically imported here — doing
// so crashes the whole bundle at startup (TurboModuleRegistry RNGoogleSignin
// not found) and breaks every expo-router route. Google sign-in is lazy-loaded
// in utils/googleSignin.ts only when the user taps the Google button.

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? ""
};

// ─── EmailJS Configuration ─────────────────────────────────────────────────
// Values come strictly from EXPO_PUBLIC_* env vars (see .env.example).
export const EMAILJS_CONFIG = {
  serviceId: process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID ?? "",
  templateId: process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID ?? "",
  publicKey: process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY ?? "",
};

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
let auth: Auth;

// initializeAuth must run first so AsyncStorage persistence is used.
// getAuth() never throws when uninitialized (it auto-initializes without
// persistence), so calling it first would silently skip persistence.
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error: any) {
  // Hot reload: auth already initialized
  if (error?.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    console.error("Firebase Auth initialization failed:", error);
    throw error;
  }
}

console.log("Firebase + Auth initialized successfully.");

export { db, auth };
