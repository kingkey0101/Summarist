import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { type Auth, getAuth, type User } from "firebase/auth";
import {
  doc,
  type Firestore,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
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

  // Check if profile already exists
  const existingProfile = await getDoc(ref);

  if (!existingProfile.exists()) {
    // Only create profile if it doesn't exist - start users with free plan
    await setDoc(ref, {
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      subscribed: false, // New users start as free (not subscribed)
      plan: "free", // Default to free plan for new users
      subscriptionDate: null,
      createdAt: serverTimestamp(),
    });
    console.log(`Created new profile for user ${user.uid} with free plan`);
  } else {
    // Just update user info, preserve existing subscription
    await setDoc(
      ref,
      {
        uid: user.uid,
        email: user.email ?? null,
        displayName: user.displayName ?? null,
        photoURL: user.photoURL ?? null,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    console.log(`Updated existing profile for user ${user.uid}`);
  }
}

export async function updateUserSubscription(
  user: User,
  plan: "free" | "basic" | "premium-monthly" | "premium-yearly",
  isSubscribed: boolean,
) {
  const db = getFirebaseDb();
  if (!db) return;

  const profileRef = doc(db, "profiles", user.uid);
  await setDoc(
    profileRef,
    {
      subscribed: isSubscribed,
      plan: plan,
      subscriptionDate: isSubscribed ? serverTimestamp() : null,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getUserProfile(
  uid: string,
): Promise<Record<string, unknown> | null> {
  const db = getFirebaseDb();
  if (!db) return null;
  try {
    const ref = doc(db, "profiles", uid);
    const snap = await getDoc(ref);
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
    const ref = doc(
      db,
      "users",
      user.uid,
      "library",
      String(book.id ?? Date.now()),
    );
    await setDoc(
      ref,
      {
        ...book,
        addedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (err) {
    console.error("addBookToLibrary error:", err);
    throw err;
  }
}

export async function markBookAsFinished(
  user: User,
  book: Record<string, unknown>,
) {
  const db = getFirebaseDb();
  if (!db) return;
  try {
    const ref = doc(
      db,
      "users",
      user.uid,
      "finished",
      String(book.id ?? Date.now()),
    );
    await setDoc(
      ref,
      {
        ...book,
        finishedAt: serverTimestamp(),
      },
      { merge: true },
    );
    console.log("Book marked as finished successfully");
  } catch (err) {
    console.error("markBookAsFinished error:", err);
    throw err;
  }
}

// dev debug helpers (safe to remove after debugging)
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // biome-ignore lint/suspicious/noExplicitAny: Required for extending global window object
  (window as any).getFirebaseApp = getFirebaseApp;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // biome-ignore lint/suspicious/noExplicitAny: Required for extending global window object
  (window as any).getFirebaseAuth = getFirebaseAuth;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // biome-ignore lint/suspicious/noExplicitAny: Required for extending global window object
  (window as any).getFirebaseDb = getFirebaseDb;
}
