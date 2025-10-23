"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import LoginButton from "./LoginButton";

export default function Avatar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  if (!user) return <LoginButton />;

  //   const src = user.photoURL ?? null;
  return (
    <button
      type="button"
      onClick={() => router.push("/for-you")}
      aria-label="Account"
      className="inline-flex items-center"
    >
      {/* <Image
        src={ }
        
        alt={user.displayName ?? "Account"}
        className="w-9 h-9 rounded-full object-cover border"
      /> */}
    </button>
  );
}
