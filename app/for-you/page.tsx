"use client";

import { type User } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebaseClient";
// import Search from "../components/Search";
import SideBar from "../components/SideBar";

export default function ForYouPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    setUser(auth.currentUser ?? null);
  }, []);

  return (
    <main className="p-8 max-w-3xl md:ml-64">
      <div className="flex justify-end">
        <div className="w-full max-w-[1070px]">{/* <Search /> */}</div>
      </div>
      <div className="sidebar block">
        <SideBar />
      </div>

    </main>
  );
}
