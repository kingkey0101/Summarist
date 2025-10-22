"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebaseClient";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export default function LoginButton({ className = "", children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

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

  function handleClick() {
    if (user) {
      router.push("/for-you");
    } else {
      openModal();
    }
  }

  const classes =
    `${className} inline-flex items-center gap-2 px-3 py-1`.trim();
  return (
    <button type="button" onClick={handleClick} className={classes}>
      {user ? "For you" : (children ?? "Login")}
    </button>
  );
}
