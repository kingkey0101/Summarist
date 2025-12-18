"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSubscription } from "@/app/context/SubscriptionContext";
import type { BookDetail } from "@/lib/BookDetail";

interface PremiumAccessGuardProps {
  book: BookDetail;
  children: React.ReactNode;
}

export default function PremiumAccessGuard({
  book,
  children,
}: PremiumAccessGuardProps) {
  const router = useRouter();
  const { subscription, isLoading, hasPremiumAccess } = useSubscription();
  const [hasCheckedAccess, setHasCheckedAccess] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // Debug logging to understand the issue
    console.log("PremiumAccessGuard Debug:", {
      bookType: book.type,
      subscriptionPlan: subscription.plan,
      isSubscribed: subscription.isSubscribed,
      hasPremiumAccess: hasPremiumAccess(),
      subscriptionState: subscription,
      shouldRedirect: book.type === "premium" && !hasPremiumAccess(),
    });

    // Strong check: If this is a premium book and user doesn't have premium access, redirect
    const isPremiumBook =
      book.type === "premium" || book.subscriptionRequired === true;
    const userHasPremiumAccess = hasPremiumAccess();

    if (isPremiumBook && !userHasPremiumAccess) {
      console.log(
        `ACCESS DENIED: Premium content blocked. Book: ${book.title}, User plan: ${subscription.plan}`,
      );
      router.push("/choose-plan");
      return;
    }

    setHasCheckedAccess(true);
  }, [
    book.type,
    book.subscriptionRequired,
    book.title,
    subscription.plan,
    hasPremiumAccess,
    isLoading,
    router,
    subscription,
  ]);

  // Show loading state while checking subscription
  if (isLoading || !hasCheckedAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  // If we reach here, user has access to the content
  return <>{children}</>;
}
