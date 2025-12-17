import admin from "firebase-admin";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  console.warn("STRIPE_SECRET_KEY is not set");
}
const stripe = new Stripe(stripeSecret ?? "", {
  apiVersion: "2025-11-17.clover",
});

// initialize Firebase Admin
function initFirebaseAdmin() {
  if (admin.apps?.length) return admin.app();

  const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (svcJson) {
    const credentials = JSON.parse(svcJson);
    return admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
  }

  return admin.initializeApp();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, priceCents, interval, title, idToken } = body as {
      planId?: string;
      priceCents?: number;
      interval?: "month" | "year";
      title?: string;
      idToken?: string;
    };

    if (!planId || !priceCents || !interval) {
      return NextResponse.json(
        { error: "Missing planId, priceCents or interval" },
        { status: 400 },
      );
    }

    if (!idToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // verify ID token and obtain uid
    try {
      const firebaseApp = initFirebaseAdmin();
      const decoded = await admin.auth(firebaseApp).verifyIdToken(idToken);
      if (!decoded?.uid) {
        return NextResponse.json(
          { error: "Invalid auth token" },
          { status: 401 },
        );
      }
      const uid = decoded.uid;

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: title ?? "Summarist Premium",
              },
              recurring: { interval: interval },
              unit_amount: priceCents,
            },
            quantity: 1,
          },
        ],
        success_url: `${siteUrl}/for-you?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/choose-plan`,
        metadata: {
          uid,
        },
      });

      return NextResponse.json({ url: session.url ?? null });
    } catch (err) {
      console.error("Auth verification failed:", err);
      return NextResponse.json(
        { error: "Invalid auth token" },
        { status: 401 },
      );
    }
  } catch (err) {
    console.error("create-checkout error:", err);
    return NextResponse.json(
      { error: (err as Error)?.message ?? "unknown" },
      { status: 500 },
    );
  }
}
