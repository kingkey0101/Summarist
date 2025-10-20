"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseClient";
import AuthModal from "./AuthModal";

export default function LoginButton() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        {user ? (user.email ?? "Account") : "Login"}
      </button>
      <AuthModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
