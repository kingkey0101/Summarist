"use client";

import type { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import Search from "../components/Search";
import SelectedForYou from "../components/SelectedBook";
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
      <div className="w-full flex justify-between gap-6">
        <div className="flex-1 max-w-[681px]">
          <SelectedForYou
            apiUrl={process.env.NEXT_PUBLIC_RECOMMENDATION_API_URL ?? ""}
          />
        </div>
        <div className=" w-[340px] flex justify-end">
          <Search />
        </div>
      </div>

      <div className="sidebar block">
        <SideBar />
      </div>
    </main>
  );
}
