// Firebase configuration and initialization
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

export function isFirebaseConfigured() {
  return Boolean(
    process.env.REACT_APP_FIREBASE_API_KEY && 
    process.env.REACT_APP_FIREBASE_API_KEY !== 'undefined' &&
    process.env.REACT_APP_FIREBASE_API_KEY.trim() !== ''
  );
}

// Initialize Firebase (singleton pattern)
export function getFirebaseApp() {
  if (!isFirebaseConfigured()) {
    return null;
  }
  try {
    return getApps()[0] || initializeApp(firebaseConfig);
  } catch (error) {
    console.warn('Firebase initialization skipped or failed:', error.message);
    return null;
  }
}

// Get Auth instance
export function getFirebaseAuth() {
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    return getAuth(app);
  } catch (error) {
    console.warn('Firebase Auth initialization skipped or failed:', error.message);
    return null;
  }
}

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Sign in with Google
export async function signInWithGoogle() {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Please set REACT_APP_FIREBASE_API_KEY in .env');
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await user.getIdToken();
    
    return {
      user: {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        picture: user.photoURL
      },
      idToken
    };
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

// Sign out
export async function firebaseSignOut() {
  const auth = getFirebaseAuth();
  if (auth) {
    await signOut(auth);
  }
}

// Auth state observer
export function onFirebaseAuthStateChanged(callback) {
  const auth = getFirebaseAuth();
  if (!auth) {
    return () => {}; // return empty cleanup function if Firebase Auth is not active
  }
  try {
    return onAuthStateChanged(auth, callback);
  } catch (error) {
    console.warn('onAuthStateChanged error:', error.message);
    return () => {};
  }
}

// Get current user's ID token
export async function getCurrentUserIdToken() {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
}

export { googleProvider };
