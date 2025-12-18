"use client";

import type { User } from "firebase/auth";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getFirebaseAuth,
  getUserProfile,
  updateUserSubscription,
} from "@/lib/firebaseClient";

type SubscriptionPlan = "free" | "basic" | "premium-monthly" | "premium-yearly";

interface SubscriptionState {
  plan: SubscriptionPlan;
  isSubscribed: boolean;
  subscriptionDate?: Date;
  hasPremiumAccess: boolean; // Helper to check premium access
}

interface SubscriptionContextType {
  subscription: SubscriptionState;
  user: User | null;
  isLoading: boolean;
  simulateSubscription: (plan: SubscriptionPlan) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  hasPremiumAccess: () => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionState>({
    plan: "free",
    isSubscribed: false,
    hasPremiumAccess: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to check if a plan has premium access
  const checkHasPremiumAccess = useCallback(
    (plan: SubscriptionPlan): boolean => {
      return plan === "premium-monthly" || plan === "premium-yearly";
    },
    [],
  );

  const hasPremiumAccess = useCallback(
    () => checkHasPremiumAccess(subscription.plan),
    [checkHasPremiumAccess, subscription.plan],
  );

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          // Load user profile to check subscription status
          const profile = await getUserProfile(currentUser.uid);

          console.log("SubscriptionContext Debug:", {
            userId: currentUser.uid,
            profileData: profile,
          });

          if (profile) {
            const planType = (profile.plan as SubscriptionPlan) || "free";
            const currentIsSubscribed = Boolean(profile.subscribed);
            const currentPlan = currentIsSubscribed ? planType : "free";

            // Extra safety: ensure only premium plans have premium access
            const calculatedHasPremiumAccess =
              checkHasPremiumAccess(currentPlan);

            const finalSubscriptionState = {
              plan: currentPlan,
              isSubscribed: currentIsSubscribed,
              hasPremiumAccess: calculatedHasPremiumAccess, // Always recalculate
              subscriptionDate: profile.subscriptionDate
                ? new Date(profile.subscriptionDate as string)
                : undefined,
            };

            console.log("Setting subscription state:", {
              ...finalSubscriptionState,
              rawProfile: profile,
              calculatedPlan: currentPlan,
              calculatedAccess: calculatedHasPremiumAccess,
            });

            setSubscription(finalSubscriptionState);
          } else {
            console.log("No profile found for user, setting to free plan");
            // If no profile exists, set them to free (they should get basic via createProfile)
            setSubscription({
              plan: "free",
              isSubscribed: false,
              hasPremiumAccess: false,
            });
          }
        } catch (err) {
          console.warn("Failed to load user subscription data:", err);
        }
      } else {
        setSubscription({
          plan: "free",
          isSubscribed: false,
          hasPremiumAccess: false,
        });
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [checkHasPremiumAccess]);

  const simulateSubscription = async (plan: SubscriptionPlan) => {
    if (!user) throw new Error("User must be logged in");

    setIsLoading(true);
    try {
      // Simulate subscription activation
      const subscriptionDate = new Date();

      // Update user profile in Firestore
      await updateUserSubscription(user, plan, true);

      // Update local state (simulating what would happen after Stripe webhook)
      setSubscription({
        plan,
        isSubscribed: true,
        hasPremiumAccess: checkHasPremiumAccess(plan),
        subscriptionDate,
      });

      console.log(`🎉 Subscription activated! Plan: ${plan}`);
    } catch (err) {
      console.error("Failed to simulate subscription:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!user) throw new Error("User must be logged in");

    setIsLoading(true);
    try {
      // Update user profile
      await updateUserSubscription(user, "free", false);

      // Update local state
      setSubscription({
        plan: "free",
        isSubscribed: false,
        hasPremiumAccess: false,
      });

      console.log("Subscription cancelled");
    } catch (err) {
      console.error("Failed to cancel subscription:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        user,
        isLoading,
        simulateSubscription,
        cancelSubscription,
        hasPremiumAccess,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return context;
}
