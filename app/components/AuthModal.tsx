"use client";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "../../lib/firebaseClient";

type Props = {
  isOpen: boolean;
  onClose(): void;
};

export default function AuthModal({ isOpen, onClose }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) onClose();
    });
    return () => unsub();
  }, [onClose]);

  if (!isOpen) return null;

  async function handleEmailAuth() {
    setLoading(true);
    setError(null);
    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Auth not available in this environment.");
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: unknown) {
      setError((err as Error)?.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Auth not available in this environment.");
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? "Google sign failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    const auth = getFirebaseAuth();
    if (auth) {
      await signOut(auth);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 auth-modal">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/50"
        onClick={() => {
          if (!loading) onClose();
        }}
      />
      <div className="relative z-10 w-full max-w-md p-6 bg-white shadow-lg">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-600 hover:text-slate-900 dark:text-slate-300"
        >
          X
        </button>
        <h3 className="text-2xl font-semibold text-center mb-4 pointer-events-none">
          {user
            ? "Account"
            : mode === "login"
              ? "Sign up for Summarist"
              : "Create account"}
        </h3>

        {user ? (
          <div className="text-center">
            <p className="mb-4">Signed in as {user.email}</p>
            <div className="flex justify-center gap-3">
              <button type="button" className="btn" onClick={handleSignOut}>
                Sign out
              </button>
              <button type="button" className="btn ghost" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={handleGoogle}
              className="google-btn w-full flex items-center gap-3 justify-center mb-4"
              disabled={loading}
            >
              <span className="google-logo w-7 h-7 inline-flex items-center justify-center bg-white rounded-sm shadow-sm">
                <svg
                  viewBox="0 0 533.5 544.3"
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="Google img"
                >
                  <path
                    d="M533.5 278.4c0-18.8-1.6-37-4.7-54.6H272v103.2h146.9c-6.4 34.7-25.3 64.1-54 83.7v69.8h87.3c51.2-47.2 81.3-116.6 81.3-202.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M272 544.3c73.7 0 135.6-24.4 180.8-66.1l-87.3-69.8c-24.2 16.3-55 25.9-93.5 25.9-71.8 0-132.7-48.5-154.5-113.6H30.3v71.3C75 488.5 167.4 544.3 272 544.3z"
                    fill="#34A853"
                  />
                  <path
                    d="M117.5 327.7c-10.8-32.4-10.8-67.4 0-99.8V156.6H30.3c-41 80.9-41 176.2 0 257.1l87.2-85.9z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M272 107.7c39.9 0 75.9 13.7 104.2 40.6l78.1-78.1C407.6 24 345.9 0 272 0 167.4 0 75 55.8 30.3 156.6l87.2 71.3C139.3 156.2 200.2 107.7 272 107.7z"
                    fill="#EA4335"
                  />
                </svg>
              </span>
              <span className="text-white font-medium">
                Sign up with Google
              </span>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-slate-200" />
              <div className="text-slate-500 text-sm">or</div>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div className="space-y-3 mb-4">
              <input
                className="input w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                type="email"
                disabled={loading}
              />
              <input
                className="input w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                disabled={loading}
              />
              {error && <div className="text-red-600 text-sm">{error}</div>}
            </div>

            <button
              type="button"
              className="w-full text-white rounded-md py-3 font-medium mb-3 signup-static"
              onClick={handleEmailAuth}
              disabled={loading}
            >
              {loading ? "Working…" : mode === "login" ? "Login" : "Sign up"}
            </button>

            <button
              type="button"
              className="w-full py-3 text-sky-700 bg-sky-50 rounded-md hover:underline"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
            >
              {mode === "login"
                ? "Create an account"
                : "Already have an account?"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
