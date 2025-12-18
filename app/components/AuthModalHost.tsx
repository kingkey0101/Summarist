"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  createProfile,
  getFirebaseAuth,
  upsertUser,
} from "@/lib/firebaseClient";
import AuthModal from "./AuthModal";

export default function AuthModalHost() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const openedByUserRef = useRef(false);

  useEffect(() => {
    function handleOpen() {
      openedByUserRef.current = true;
      setOpen(true);
    }
    function handleClose() {
      openedByUserRef.current = false;
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
        // Create profile with basic subscription for new users
        await createProfile(u);
        console.log("User profile created/updated with basic subscription");
      } catch (err) {
        console.error("User setup failed", err);
      }
      window.dispatchEvent(new CustomEvent("close-auth-modal"));
      // Always route to For You page after successful authentication
      router.push("/for-you");
    });
    return () => unsub();
  }, [router]);

  return <AuthModal isOpen={open} onClose={() => setOpen(false)} />;
}
