import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { type Auth, getAuth, type User } from "firebase/auth";
import {
  doc,
  type Firestore,
  getFirestore,
  serverTimestamp,
  setDoc,
  getDoc,
} from "firebase/firestore/lite";

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function getConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  if (app) return app;

  const config = getConfig();
  if (!config.apiKey) {
    console.warn(
      "Firebase: NEXT_PUBLIC_FIREBASE_API_KEY missing — firebase disabled in server/build.",
    );
    return null;
  }

  app = getApps()[0] ?? initializeApp(config);
  return app;
}

export function getFirebaseAuth(): Auth | null {
  if (authInstance) return authInstance;
  const a = getFirebaseApp();
  if (!a) return null;
  authInstance = getAuth(a);
  return authInstance;
}

export function getFirebaseDb(): Firestore | null {
  if (dbInstance) return dbInstance;
  const a = getFirebaseApp();
  if (!a) return null;
  dbInstance = getFirestore(a);
  return dbInstance;
}

export async function upsertUser(user: User) {
  const db = getFirebaseDb();
  if (!db) return;
  const ref = doc(db, "users", user.uid);
  await setDoc(
    ref,
    {
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      lastSeen: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function createProfile(user: User) {
  const db = getFirebaseDb();
  if (!db) return;
  const ref = doc(db, "profiles", user.uid);
  await setDoc(ref, {
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(
  uid: string,
): Promise<Record<string, unknown> | null> {
  const db = getFirebaseDb();
  if (!db) return null;
  try {
    const ref = doc(db, "profiles", uid);
    const snap = await getDoc(ref)
    return snap.exists() ? (snap.data() as Record<string, unknown>) : null;
  } catch (err) {
    console.error("getUserProfile error:", err);
    return null;
  }
}

export async function addBookToLibrary(
  user: User,
  book: Record<string, unknown>,
) {
  const db = getFirebaseDb();
  if (!db) return;
  try {
    const ref = doc(db, "users", user.uid, "library", String(book.id ?? Date.now()));
    await setDoc(
      ref,
      {
        ...book, addedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (err) {
    console.error("addBookToLibrary error:", err);
    throw err;
  }
}
