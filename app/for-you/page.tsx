"use client";

import type { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import Search from "../components/Search";
import SideBar from "../components/SideBar";

export default function ForYouPage() {
  const [_user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    setUser(auth.currentUser ?? null);
  }, []);

  return (
    <main className="p-8 md:ml-64">
      <div className="w-full flex justify-end">
        <div className="w-full max-w-[1100px] pr-72">
          <div className="flex justify-end">
            <Search />
          </div>
        </div>
      </div>

      <div className="sidebar block">
        <SideBar />
      </div>
    </main>
  );
}
