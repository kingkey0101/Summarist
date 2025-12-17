"use client";

import type { User } from "firebase/auth";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebaseClient";

type PlanId = "monthly" | "yearly";

const PLANS = [
  {
    id: "yearly" as PlanId,
    title: "Premium Plus Yearly",
    priceLabel: "$99.99/year",
    priceCents: 9999,
    interval: "year" as const,
    subtitle: "7-day free trial included",
  },
  {
    id: "monthly" as PlanId,
    title: "Premium Monthly",
    priceLabel: "$9.99/month",
    priceCents: 999,
    interval: "month" as const,
    subtitle: "No trial included",
  },
];

const FAQ_ITEMS = [
  {
    q: "How does the free 7-day trial work?",
    a: `Begin your complimentary 7-day trial with a Summarist annual membership. You are under no obligation to continue your subscription, and you will only be billed when the trial period expires. With Premium access, you can learn at your own pace and as frequently as you desire, and you may terminate your subscription prior to the conclusion of the 7-day free trial.`,
  },
  {
    q: "Can I switch subscriptions from monthly to yearly, or yearly to monthly?",
    a: `While an annual plan is active, it is not feasible to switch to a monthly plan. However, once the current month ends, transitioning from a monthly plan to an annual plan is an option.`,
  },
  {
    q: "What's included in the Premium plan?",
    a: `Premium membership provides you with the ultimate Summarist experience, including unrestricted entry to many best-selling books high-quality audio, the ability to download titles for offline reading, and the option to send your reads to your Kindle.`,
  },
  {
    q: "Can I cancel during my trial or subscription?",
    a: `You will not be charged if you cancel your trial before its conclusion. While you will not have complete access to the entire Summarist library, you can still expand your knowledge with one curated book per day.`,
  },
];

export default function ChoosePlanPage() {
  const [_user, setUser] = useState<User | null>(null);
  const [selected, setSelected] = useState<PlanId>("yearly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    setUser(auth.currentUser ?? null);
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  async function handleCheckout(planId: PlanId) {
    setError(null);
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) return;

    const auth = getFirebaseAuth();
    const currentUser = auth?.currentUser ?? null;
    if (!currentUser) {
      window.dispatchEvent(new CustomEvent("open-auth-modal"));
      return;
    }

    setLoading(true);
    try {
      console.log("Getting ID token for user:", currentUser.uid);
      const idToken = await currentUser.getIdToken();
      console.log("ID token obtained, length:", idToken.length);

      const res = await fetch("/api/createcheckout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          priceCents: plan.priceCents,
          interval: plan.interval,
          title: plan.title,
          idToken,
        }),
      });

      const json = await res.json();
      console.log("API response:", { status: res.status, json });

      if (res.ok && json?.url) {
        window.location.href = json.url;
      } else {
        throw new Error(json?.error ?? "Failed to create checkout session");
      }
    } catch (err: unknown) {
      console.error("Checkout error:", err);
      setError((err as Error)?.message ?? "Failed to create checkout");
    } finally {
      setLoading(false);
    }
  }

  function toggleFaq(i: number) {
    setOpenFaqIndex((prev) => (prev === i ? null : i));
  }

  return (
    <main className="p-0 md:pl-52">
      {/* HERO — full width dark band with centered content */}
      <section className="w-full bg-[#052e3b] relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="pt-16 pb-28 md:pt-24 md:pb-32 text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-white max-w-3xl mx-auto">
              Get unlimited access to many amazing books to read
            </h1>
            <p className="mt-4 text-sm md:text-base text-[#cfe6ec]">
              Turn ordinary moments into amazing learning opportunities
            </p>
          </div>
        </div>

        {/* big rounded bottom shape and white arch containing the image */}
        <div className="absolute left-0 right-0 bottom-0 pointer-events-none">
          {/* left and right large rounded corners to mimic screenshot */}
          <div className="hidden md:block absolute inset-x-0 -bottom-36">
            <div
              style={{ height: 220 }}
              className="mx-auto w-full bg-transparent"
            />
          </div>

          {/* centered white arch */}
          <div className="relative flex justify-center">
            <div
              className="bg-white rounded-t-[200px] w-[360px] h-[220px] -mb-[110px] flex items-center justify-center shadow-[0_10px_30px_rgba(2,8,23,0.08)] overflow-hidden"
              style={{ borderTopLeftRadius: 200, borderTopRightRadius: 200 }}
            >
              <div className="relative w-[320px] h-[180px]">
                <Image
                  src="/assets/pricing-top.png"
                  alt="hero"
                  fill
                  sizes="(max-width: 768px) 160px, 224px"
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* spacer to account for overlapping arch */}
      <div className="h-24 md:h-28" />

      {/* MAIN PAGE CONTENT */}
      <div className="max-w-3xl mx-auto px-6 pb-12">
        <div className="flex justify-center gap-10 -mt-6">
          {/* three small icons */}
          <div className="flex items-start justify-center gap-10 mt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                {/* small icon 1 */}
                <svg
                  className="w-14 h-14"
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 1024 1024"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="Document icon"
                >
                  <path d="M854.6 288.7c6 6 9.4 14.1 9.4 22.6V928c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32h424.7c8.5 0 16.7 3.4 22.7 9.4l215.2 215.3zM790.2 326L602 137.8V326h188.2zM320 482a8 8 0 0 0-8 8v48a8 8 0 0 0 8 8h384a8 8 0 0 0 8-8v-48a8 8 0 0 0-8-8H320zm0 136a8 8 0 0 0-8 8v48a8 8 0 0 0 8 8h184a8 8 0 0 0 8-8v-48a8 8 0 0 0-8-8H320z"></path>
                </svg>
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Key ideas in few min
              </div>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                {/* small icon 2 */}
                <svg
                  className="w-14 h-14"
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 24 24"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="People icon"
                >
                  <g>
                    <path fill="none" d="M0 0H24V24H0z"></path>
                    <path d="M21 3v2c0 3.866-3.134 7-7 7h-1v1h5v7c0 1.105-.895 2-2 2H8c-1.105 0-2-.895-2-2v-7h5v-3c0-3.866 3.134-7 7-7h3zM5.5 2c2.529 0 4.765 1.251 6.124 3.169C10.604 6.51 10 8.185 10 10v1h-.5C5.358 11 2 7.642 2 3.5V2h3.5z"></path>
                  </g>
                </svg>
              </div>
              <div className="text-xs text-gray-600 mt-2">
                3 million people growing
              </div>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                {/* small icon 3 */}
                <svg
                  className="w-14 h-14"
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 640 512"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="Handshake icon"
                >
                  <path d="M434.7 64h-85.9c-8 0-15.7 3-21.6 8.4l-98.3 90c-.1.1-.2.3-.3.4-16.6 15.6-16.3 40.5-2.1 56 12.7 13.9 39.4 17.6 56.1 2.7.1-.1.3-.1.4-.2l79.9-73.2c6.5-5.9 16.7-5.5 22.6 1 6 6.5 5.5 16.6-1 22.6l-26.1 23.9L504 313.8c2.9 2.4 5.5 5 7.9 7.7V128l-54.6-54.6c-5.9-6-14.1-9.4-22.6-9.4zM544 128.2v223.9c0 17.7 14.3 32 32 32h64V128.2h-96zm48 223.9c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16zM0 384h64c17.7 0 32-14.3 32-32V128.2H0V384zm48-63.9c8.8 0 16 7.2 16 16s-7.2 16-16 16-16-7.2-16-16c0-8.9 7.2-16 16-16zm435.9 18.6L334.6 217.5l-30 27.5c-29.7 27.1-75.2 24.5-101.7-4.4-26.9-29.4-24.8-74.9 4.4-101.7L289.1 64h-83.8c-8.5 0-16.6 3.4-22.6 9.4L128 128v223.9h18.3l90.5 81.9c27.4 22.3 67.7 18.1 90-9.3l.2-.2 17.9 15.5c15.9 13 39.4 10.5 52.3-5.4l31.4-38.6 5.4 4.4c13.7 11.1 33.9 9.1 45-4.7l9.5-11.7c11.2-13.8 9.1-33.9-4.6-45.1z"></path>
                </svg>
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Hand curated books
              </div>
            </div>
          </div>
        </div>

        {/* Choose plan heading */}
        <h2 className="text-2xl font-semibold mt-8 text-center">
          Choose the plan that fits you
        </h2>

        {/* Plans */}
        <div className="space-y-6 mt-6">
          <button
            type="button"
            onClick={() => setSelected("yearly")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setSelected("yearly");
            }}
            className={`cursor-pointer rounded-lg p-6 border-2 flex items-start gap-4 text-left transition-shadow ${
              selected === "yearly"
                ? "border-emerald-400 shadow-md bg-emerald-50"
                : "border-gray-300 bg-white"
            }`}
            aria-pressed={selected === "yearly"}
          >
            <div className="flex items-start pt-1">
              <div
                className={`w-5 h-5 mr-3 rounded-full border flex items-center justify-center ${
                  selected === "yearly"
                    ? "border-emerald-600"
                    : "border-gray-400"
                }`}
                aria-hidden
              >
                {selected === "yearly" ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-600 block" />
                ) : null}
              </div>
            </div>
            <div className="flex-1">
              <div className="font-medium text-lg">{PLANS[0].title}</div>
              <div className="text-2xl font-bold mt-2">
                {PLANS[0].priceLabel}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {PLANS[0].subtitle}
              </div>
            </div>
          </button>

          <div className="flex items-center justify-center">
            <div className="border-t w-1/3 border-gray-200" />
            <div className="mx-4 text-gray-400">or</div>
            <div className="border-t w-1/3 border-gray-200" />
          </div>

          <button
            type="button"
            onClick={() => setSelected("monthly")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setSelected("monthly");
            }}
            className={`cursor-pointer rounded-lg p-6 border-2 flex items-start gap-4 text-left transition-shadow ${
              selected === "monthly"
                ? "border-emerald-400 shadow-md bg-emerald-50"
                : "border-gray-300 bg-white"
            }`}
            aria-pressed={selected === "monthly"}
          >
            <div className="flex items-start pt-1">
              <div
                className={`w-5 h-5 mr-3 rounded-full border flex items-center justify-center ${
                  selected === "monthly"
                    ? "border-emerald-600"
                    : "border-gray-400"
                }`}
                aria-hidden
              >
                {selected === "monthly" ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-600 block" />
                ) : null}
              </div>
            </div>
            <div className="flex-1">
              <div className="font-medium text-lg">{PLANS[1].title}</div>
              <div className="text-2xl font-bold mt-2">
                {PLANS[1].priceLabel}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {PLANS[1].subtitle}
              </div>
            </div>
          </button>
        </div>

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => handleCheckout(selected)}
            disabled={loading}
            className={`px-6 py-3 rounded-md text-white font-medium ${
              loading
                ? "bg-emerald-400 opacity-80 cursor-wait"
                : "bg-emerald-500 hover:bg-emerald-600"
            }`}
          >
            {selected === "yearly"
              ? "Start your free 7-day trial"
              : "Start monthly subscription"}
          </button>
        </div>

        <div className="text-xs text-gray-500 mt-3 text-center">
          {selected === "yearly"
            ? "Cancel your trial at any time before it ends, and you won't be charged."
            : "Monthly billing. Cancel anytime."}
        </div>

        {/* FAQ / Accordion Section */}
        <section className="mt-10 text-left w-full">
          {FAQ_ITEMS.map((it, i) => {
            const open = openFaqIndex === i;
            return (
              <div key={it.q} className="border-t last:border-b">
                <button
                  id={`faq-btn-${i}`}
                  type="button"
                  onClick={() => toggleFaq(i)}
                  aria-expanded={open}
                  aria-controls={`faq-panel-${i}`}
                  className="w-full px-4 py-6 flex items-center justify-between text-left"
                >
                  <span className="text-lg text-black">{it.q}</span>
                  <svg
                    className={`w-6 h-6 text-gray-500 transform transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="none"
                    role="img"
                    aria-label="Expand or collapse"
                  >
                    <path
                      d="M6 8l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {open && (
                  <section
                    id={`faq-panel-${i}`}
                    aria-labelledby={`faq-btn-${i}`}
                    className="px-4 pb-6"
                  >
                    <p className="text-sm text-gray-700">{it.a}</p>
                  </section>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
