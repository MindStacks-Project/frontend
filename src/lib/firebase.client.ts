// // apps/web/lib/firebase.ts
// import { initializeApp } from "firebase/app";
// import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
// };
// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const googleProvider = new GoogleAuthProvider();


// Client-only Firebase singletons for Next.js (App Router safe)
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
};

const app = getApps().length ? getApp() : initializeApp(cfg);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Persist login across tabs/refresh (client only)
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence);
}

// --- NEW: Game Data Saving Logic ---

/**
 * Saves a detailed game log to the user's personal 'games' sub-collection.
 * This enables advanced analytics (Win Rate, Improvement, etc.) on the Profile page.
 */
export async function saveGameResult(userId: string, gameData: any) {
  if (!userId) {
    console.warn("Cannot save game: No User ID provided.");
    return;
  }

  try {
    // 1. Reference the 'games' sub-collection inside the specific user
    const gamesRef = collection(db, "users", userId, "games");

    // 2. Save the detailed log
    // We spread (...gameData) to save the full JSON, but also extract key fields
    // to the top level to make Firestore sorting and filtering easier/cheaper.
    await addDoc(gamesRef, {
      ...gameData,
      timestamp: serverTimestamp(), // Server time is strictly ordered
      // Top-level fields for easy indexing:
      outcome: gameData.outcome || "unknown",
      totalGuesses: gameData.metrics?.totalGuesses || 0,
      durationSeconds: gameData.metrics?.durationSeconds || 0,
      difficulty: gameData.metadata?.difficulty || "standard",
      puzzleId: gameData.metadata?.puzzleId || "unknown"
    });

    console.log("✅ Game saved successfully to Firestore!");
  } catch (error) {
    console.error("❌ Error saving game to Firestore:", error);
  }
}