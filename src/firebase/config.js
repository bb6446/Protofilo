// Firebase Configuration & Credentials
// You can supply real keys via Vite .env variables (VITE_FIREBASE_*) or edit them here.

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBiplobArtDesignStudioKey2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "biplob-art-portfolio.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "biplob-art-portfolio",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "biplob-art-portfolio.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "102938475612",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:102938475612:web:a1b2c3d4e5f6g7h8"
};

export const isFirebaseConfigured = Boolean(firebaseConfig.projectId);
