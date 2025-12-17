"use client";

import type { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import Nav from "../components/Nav";
import RecoommendedBooks from "../components/RecommendedBooks";
import SelectedForYou from "../components/SelectedBook";
import SuggestedBooks from "../components/SuggestedBooks";

export default function ForYouPage() {
  const [_user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    setUser(auth.currentUser ?? null);
  }, []);

  return (
    <>
      <Nav />
      <main className="p-4 md:p-8 md:pl-52">
        <div className="max-w-[1024px] mx-auto">
          <div className="flex-1 max-w-[681px] mx-auto">
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
      </main>
    </>
  );
}
