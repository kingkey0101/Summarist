"use client";

import type { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import RecoommendedBooks from "../components/RecommendedBooks";
import Search from "../components/Search";
import SelectedForYou from "../components/SelectedBook";
import SideBar from "../components/SideBar";
import SuggestedBooks from "../components/SuggestedBooks";

export default function ForYouPage() {
  const [_user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    setUser(auth.currentUser ?? null);
  }, []);

  return (
    <main className="p-8 md:ml-64 lg:ml-[300px]">
      <div className="w-full flex justify-center ml-[250px]">
        <div className="w-[340px]">
          <Search />
        </div>
      </div>
      <hr aria-hidden className="border-t border-gray-200 my-6" />
      <div className="">
        <div className="flex-1 max-w-[681px] ml-[220px] -mt-10">
          <SelectedForYou
            apiUrl={process.env.NEXT_PUBLIC_SELECTED_API_URL ?? ""}
          />
          <RecoommendedBooks
            apiUrl={
              process.env.NEXT_PUBLIC_RECOMMENDATION_API_URL +
              "&type=recommended&limit=5"
            }
          />
          <SuggestedBooks
            apiUrl={
              process.env.NEXT_PUBLIC_SUGGESTED_API_URL +
              "&type=suggested&limit=5"
            }
          />
        </div>
      </div>
      <div className="sidebar block">
        <SideBar />
      </div>
    </main>
  );
}
