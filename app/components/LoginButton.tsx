"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebaseClient";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export default function LoginButton({ className = "", children }: Props) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  function openModal() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-auth-modal"));
    }
  }

  const classes =
    `${className} inline-flex items-center gap-2 px-3 py-1`.trim();
  return (
    <button type="button" onClick={openModal} className={classes}>
      {user ? (user.email ?? "Account") : (children ?? "Login")}
    </button>
  );
}
