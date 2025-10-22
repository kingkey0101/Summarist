"use client";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
// import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPortal } from "react-dom";
import { getFirebaseAuth } from "../../lib/firebaseClient";

type Props = {
  isOpen: boolean;
  onClose(): void;
};

export default function AuthModal({ isOpen, onClose }: Props) {
  // const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user] = useState<User | null>(null);

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

  async function handleGuest() {
    setLoading(true);
    setError(null);
    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Auth not available in this environment.");
      const cred = await signInAnonymously(auth);
      console.log("signInAnonymously success:", cred?.user?.uid, cred?.user);
      await signInAnonymously(auth);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? "Guest sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError("Enter your email to reset your password");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Auth not available in this environment.");
      await sendPasswordResetEmail(auth, email);
      setError("Password reset email sent - check your inbox.");
    } catch (err: unknown) {
      setError((err as Error)?.message ?? "Password reset failed");
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

  const modal = (
    <>
      {/* overlay: cover page, block interactions */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-black/50 z-9999 pointer-events-auto"
        onClick={() => {
          if (!loading) onClose();
        }}
      />

      {/* modal panel */}
      <div className="fixed inset-0 z-10000 flex items-start justify-center pt-44 px-4">
        <div className="relative w-full max-w-96 p-6 bg-white rounded-lg shadow-lg auth-modal">
          <button
            type="button"
            aria-label="close modal"
            disabled={loading}
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-600 hover:text-slate-900 dark:text-slate-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-6 h-6"
              aria-hidden="true"
            >
              <path
                d="M6.2253 4.81108C5.83477 4.42056 5.20161 4.42056 4.81108 4.81108C4.42056 5.20161 4.42056 5.83477 4.81108 6.2253L10.5858 12L4.81114 17.7747C4.42062 18.1652 4.42062 18.7984 4.81114 19.1889C5.20167 19.5794 5.83483 19.5794 6.22535 19.1889L12 13.4142L17.7747 19.1889C18.1652 19.5794 18.7984 19.5794 19.1889 19.1889C19.5794 18.7984 19.5794 18.1652 19.1889 17.7747L13.4142 12L19.189 6.2253C19.5795 5.83477 19.5795 5.20161 19.189 4.81108C18.7985 4.42056 18.1653 4.42056 17.7748 4.81108L12 10.5858L6.2253 4.81108Z"
                fill="currentColor"
              />
            </svg>
          </button>

          {/* header */}
          <h3 className="text-2xl font-semibold text-center mb-4 pointer-events-none">
            {user
              ? "Account"
              : mode === "login"
                ? "Sign in to Summarist"
                : "Create account"}
          </h3>

          {user ? (
            <div className="text-center">
              <p className="mb-4">Signed in as {user.email ?? "Guest"}</p>
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
              {/* Guest + Google (stacked on mobile) */}
              <div className="flex flex-col items-center gap-3 mb-4">
                <button
                  type="button"
                  onClick={handleGuest}
                  className="google-btn relative flex-1 w-full flex items-center justify-center pl-10 pr-4 py-3 rounded-md bg-slate-800 hover:bg-slate-900 text-white"
                  disabled={loading}
                >
                  <span className="absolute left-3 inline-flex w-7 h-7 items-center justify-center bg-white rounded-sm shadow-sm text-slate-800">
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 448 512"
                      height="1em"
                      width="1em"
                      role="img"
                      aria-label="guest login"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z" />
                    </svg>
                  </span>
                  <span className="text-white font-medium">
                    Login as a Guest
                  </span>
                </button>

                <div className="flex items-center gap-3 w-full">
                  <div className="flex-1 h-px bg-slate-200" />
                  <div className="text-slate-500 text-sm">or</div>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogle}
                  className="google-btn relative flex-1 w-full flex items-center gap-3 justify-center py-3 rounded-md bg-white border shadow-sm"
                  disabled={loading}
                >
                  <span className="absolute left-3 w-7 h-7 inline-flex items-center justify-center bg-white rounded-sm shadow-sm">
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
                  <span className="text-whit font-medium">
                    Sign in with Google
                  </span>
                </button>
              </div>

              {/* email / password inputs */}
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

              {/* Login / Sign up button */}
              <button
                type="button"
                className="w-full text-black rounded-md py-3 font-medium mb-3 bg-green-400 hover:bg-green-500"
                onClick={handleEmailAuth}
                disabled={loading}
              >
                {loading ? "Working…" : mode === "login" ? "Login" : "Sign up"}
              </button>

              {/* forgot password + toggle to sign up */}
              <div className="mt-2 text-sm flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sky-600 hover:underline"
                  disabled={loading}
                >
                  Forgot your password?
                </button>
                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="auth-toggle-btn"
                  disabled={loading}
                >
                  {mode === "login"
                    ? "Don't have an account?"
                    : "Back to login"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
  return typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}
