"use client";

import { useSubscription } from "@/app/context/SubscriptionContext";

interface PremiumBadgeProps {
  bookType?: string;
  subscriptionRequired?: boolean;
  className?: string;
}

export default function PremiumBadge({
  bookType,
  subscriptionRequired,
  className = "",
}: PremiumBadgeProps) {
  const { hasPremiumAccess } = useSubscription();

  // Determine if this is a premium book
  const isPremiumBook = bookType === "premium" || subscriptionRequired;

  // Don't show badge if user has premium access or if book is not premium
  if (hasPremiumAccess() || !isPremiumBook) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium bg-black text-white rounded-full ${className}`}
      role="img"
      aria-label="Premium content"
    >
      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <title>Lock icon</title>
        <path
          fillRule="evenodd"
          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
          clipRule="evenodd"
        />
      </svg>
      Premium
    </span>
  );
}
