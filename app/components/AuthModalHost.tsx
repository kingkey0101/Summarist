"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirebaseAuth, upsertUser } from "@/lib/firebaseClient";
import AuthModal from "./AuthModal";

export default function AuthModalHost() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
    }
    function handleClose() {
      setOpen(false);
    }

    window.addEventListener("open-auth-modal", handleOpen);
    window.addEventListener("close-auth-modal", handleClose);
    return () => {
      window.removeEventListener("open-auth-modal", handleOpen);
      window.removeEventListener("close-auth-modal", handleClose);
    };
  }, []);
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;
      try {
        await upsertUser(u);
      } catch (err) {
        console.error("upsertUser failed", err);
      }
      window.dispatchEvent(new CustomEvent("close-auth-modal"));
      router.push("/for-you");
    });
    return () => unsub();
  }, [router]);
  return <AuthModal isOpen={open} onClose={() => setOpen(false)} />;
}
