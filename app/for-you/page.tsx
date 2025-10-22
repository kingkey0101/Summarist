"use client";

import { signOut, type User } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import Search from "../components/Search";

export default function ForYouPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    setUser(auth.currentUser ?? null);
  }, []);

  async function handleSignOut() {
    const auth = getFirebaseAuth();
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (err) {
      console.error("signOut failed", err);
    } finally {
      router.push("/");
    }
  }

  return (
    <main className="p-8 max-w-3xl">
      <div className="flex justify-end">
        <div className="w-full max-w-[1070px]">
          <Search />
        </div>
      </div>
      <div className="flex justify-start items-start">
        <Image
          className="for-you-logo"
          src={"/assets/logo.png"}
          alt="summarist logo"
          width={160}
          height={114}
          style={{ objectFit: "scale-down" }}
          sizes="(max-width: 768px) 240px, 495px"
          priority
        />
      </div>
      <p className="mt-4">
        {user ? `Signed in as ${user.email ?? "Guest"}` : "Not signed in"}
      </p>
      <div className="mt-6">
        <Link href={"/"}>← Back home </Link>
        {user && (
          <button
            onClick={handleSignOut}
            className="btn h-10! w-auto! px-4"
            type="button"
          >
            Sign out
          </button>
        )}
      </div>
    </main>
  );
}
