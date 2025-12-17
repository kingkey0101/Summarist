"use client";

import type { User } from "firebase/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirebaseAuth, getUserProfile } from "@/lib/firebaseClient";
// import SideBar from "../components/SideBar";
import Skeleton from "../components/Skeleton";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    setUser(auth.currentUser ?? null);
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadProfile(uid: string) {
      setLoadingProfile(true);
      try {
        const p = await getUserProfile(uid);
        if (mounted) setProfile(p ?? null);
      } catch (err) {
        console.error("getUserProfile failed", err);
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    }
    if (user?.uid) loadProfile(user.uid);
    return () => {
      mounted = false;
      setProfile(null);
    };
  }, [user]);

  function openLogin() {
    window.dispatchEvent(new CustomEvent("open-auth-modal"));
  }

  function handleUpgrade() {
    router.push("/choose-plan");
  }

  const planFromProfile = (() => {
    const p = profile as {
      plan?: string;
      subscriptionPlan?: string;
      tier?: string;
      subscription?: { plan?: string };
      subscribed?: boolean;
    } | null;
    if (!p) return "Basic";
    const plan = (p.plan ||
      p.subscriptionPlan ||
      p.tier ||
      p?.subscription?.plan) as string | undefined;
    if (typeof plan === "string") {
      const v = plan.toLowerCase();
      if (v.includes("plus")) return "Premium Plus";
      if (v.includes("premium")) return "Premium";
    }
    if (p.subscribed === true) return "Premium";
    return "Basic";
  })();

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 md:pl-56">
      <div className="max-w-4xl mx-auto">
        {!user ? (
          <div className="text-center py-12 md:py-20">
            <div className="mx-auto w-80 h-56 md:w-[360px] md:h-[220px] relative mb-6">
              <Image
                src="/assets/login.png"
                alt="Please sign in"
                fill
                style={{ objectFit: "contain" }}
                sizes="(max-width: 768px) 320px, 360px"
                priority
              />
            </div>

            <h2 className="text-xl md:text-2xl font-semibold mb-3">
              Log in to your account to see your details
            </h2>
            <p className="text-gray-600 mb-6 text-sm md:text-base">
              Access your subscription, downloads, and account settings.
            </p>

            <button
              type="button"
              onClick={openLogin}
              className="bg-[#2bd97c] text-[#032b41] px-6 md:px-8 py-2 rounded-md font-medium shadow-md hover:brightness-95 transition-all"
            >
              Login
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Account</h2>

            <div className="space-y-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Email</div>
                <div className="text-sm md:text-base">
                  {user.email ?? "No email available"}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">Subscription</div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {loadingProfile ? (
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-6 w-36" />
                      <Skeleton className="h-8 w-24 rounded" />
                    </div>
                  ) : (
                    <>
                      <div className="text-sm md:text-base font-medium">
                        {planFromProfile}
                      </div>
                      {planFromProfile === "Basic" && (
                        <button
                          type="button"
                          onClick={handleUpgrade}
                          className="px-4 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-sm"
                        >
                          Upgrade
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  {loadingProfile ? (
                    <Skeleton className="h-3 w-64" />
                  ) : planFromProfile === "Basic" ? (
                    "You are currently on the free/basic plan."
                  ) : (
                    `You have the ${planFromProfile} plan.`
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
