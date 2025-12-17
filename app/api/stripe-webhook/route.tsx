import admin from "firebase-admin";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Type definition for subscription with period fields
type SubscriptionWithPeriod = Stripe.Subscription & {
  current_period_start?: number;
  current_period_end?: number;
};

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? "";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-12-15.clover" });

// initialize Firebase Admin (support SERVICE_ACCOUNT JSON in env or ADC)
function initFirebaseAdmin() {
  if (admin.apps?.length) return admin.app();

  const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (svcJson) {
    const credentials = JSON.parse(svcJson);
    return admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
  }

  // Only attempt ADC if we're in production (not during build)
  if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
    return admin.initializeApp();
  }

  // For build time or development without credentials, return null
  return null;
}

export async function POST(req: Request) {
  if (!webhookSecret) {
    console.warn("STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const buf = await req.text(); // raw body is required to verify signature
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // lazy init admin to keep cold-start impact small
  const firebaseApp = initFirebaseAdmin();
  if (!firebaseApp) {
    console.error("Firebase Admin not available");
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
  const db = admin.firestore(firebaseApp);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : undefined;
        const email =
          session.customer_details?.email ?? session.customer_email ?? null;

        // If subscription id exists, fetch subscription details
        let subscription: SubscriptionWithPeriod | null = null;
        if (subscriptionId) {
          try {
            subscription = (await stripe.subscriptions.retrieve(
              subscriptionId,
            )) as SubscriptionWithPeriod;
          } catch (err) {
            console.warn("Failed to retrieve subscription", err);
          }
        }

        // Resolve user by email (best-effort)
        let userDocRef: admin.firestore.DocumentReference | null = null;
        if (email) {
          const q = await db
            .collection("users")
            .where("email", "==", email)
            .limit(1)
            .get();
          if (!q.empty) userDocRef = q.docs[0].ref;
        }

        // fallback: create/attach to a 'stripe_customers' doc if no user found
        if (!userDocRef) {
          const stripeCustomersRef = db
            .collection("stripe_customers")
            .doc(String(session.customer ?? "unknown"));
          await stripeCustomersRef.set(
            {
              email: email ?? null,
              stripeCustomerId: session.customer ?? null,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
          // store subscription under stripe_customers/<customerId>/subscriptions/<subId>
          if (subscriptionId) {
            await stripeCustomersRef
              .collection("subscriptions")
              .doc(subscriptionId)
              .set(
                {
                  id: subscriptionId,
                  status: subscription?.status ?? "unknown",
                  stripeCustomerId: session.customer ?? null,
                  price:
                    subscription?.items?.data?.[0]?.price?.unit_amount ?? null,
                  interval:
                    subscription?.items?.data?.[0]?.price?.recurring
                      ?.interval ?? null,
                  current_period_start:
                    subscription?.current_period_start ?? null,
                  current_period_end: subscription?.current_period_end ?? null,
                  raw: subscription ?? session,
                  createdAt: admin.firestore.FieldValue.serverTimestamp(),
                },
                { merge: true },
              );
          }
        } else {
          // save under users/{uid}/subscriptions/{subscriptionId}
          if (subscriptionId) {
            const subRef = userDocRef
              .collection("subscriptions")
              .doc(subscriptionId);
            await subRef.set(
              {
                id: subscriptionId,
                status: subscription?.status ?? "unknown",
                stripeCustomerId: session.customer ?? null,
                price:
                  subscription?.items?.data?.[0]?.price?.unit_amount ?? null,
                interval:
                  subscription?.items?.data?.[0]?.price?.recurring?.interval ??
                  null,
                current_period_start:
                  subscription?.current_period_start ?? null,
                current_period_end: subscription?.current_period_end ?? null,
                raw: subscription ?? session,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true },
            );
          } else {
            // no subscription id (rare for subscription mode) — record session
            await userDocRef
              .collection("subscriptions")
              .doc(`session-${session.id}`)
              .set(
                {
                  sessionId: session.id,
                  stripeCustomerId: session.customer ?? null,
                  email,
                  raw: session,
                  createdAt: admin.firestore.FieldValue.serverTimestamp(),
                },
                { merge: true },
              );
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        // subscription payment succeeded — update subscription record
        const invoice = event.data.object as Stripe.Invoice;
        // Handle subscription ID extraction more safely
        let subscriptionId: string | undefined;
        const invoiceWithSubscription = invoice as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription;
        };
        if (invoiceWithSubscription.subscription) {
          subscriptionId =
            typeof invoiceWithSubscription.subscription === "string"
              ? invoiceWithSubscription.subscription
              : invoiceWithSubscription.subscription.id;
        }
        const email = invoice.customer_email ?? null;
        if (subscriptionId) {
          // try find user by email
          let userDocRef: admin.firestore.DocumentReference | null = null;
          if (email) {
            const q = await db
              .collection("users")
              .where("email", "==", email)
              .limit(1)
              .get();
            if (!q.empty) userDocRef = q.docs[0].ref;
          }
          if (userDocRef) {
            const subRef = userDocRef
              .collection("subscriptions")
              .doc(subscriptionId);
            await subRef.set(
              {
                lastInvoiceId: invoice.id,
                lastPaymentTimestamp:
                  admin.firestore.FieldValue.serverTimestamp(),
                status: "active",
                invoice: invoice,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true },
            );
          } else {
            // store under stripe_customers
            const custRef = db
              .collection("stripe_customers")
              .doc(String(invoice.customer ?? "unknown"));
            await custRef.collection("subscriptions").doc(subscriptionId).set(
              {
                lastInvoiceId: invoice.id,
                status: "active",
                invoice,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true },
            );
          }
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;
        const customer = subscription.customer;
        // attempt to find user by stripe customer id in stripe_customers collection
        const custDocs = await db
          .collection("stripe_customers")
          .where("stripeCustomerId", "==", String(customer))
          .limit(1)
          .get();
        if (!custDocs.empty) {
          const custRef = custDocs.docs[0].ref;
          await custRef.collection("subscriptions").doc(subscriptionId).set(
            {
              id: subscriptionId,
              status: subscription.status,
              raw: subscription,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
        } else {
          // best-effort: try to get customer email from the subscription customer
          let email: string | null = null;
          if (
            typeof subscription.customer === "object" &&
            subscription.customer &&
            "email" in subscription.customer
          ) {
            email = subscription.customer.email;
          }
          if (email) {
            const q = await db
              .collection("users")
              .where("email", "==", email)
              .limit(1)
              .get();
            if (!q.empty) {
              const userRef = q.docs[0].ref;
              await userRef.collection("subscriptions").doc(subscriptionId).set(
                {
                  id: subscriptionId,
                  status: subscription.status,
                  raw: subscription,
                  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                },
                { merge: true },
              );
            }
          }
        }
        break;
      }

      default:
        // ignore other events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { error: (err as Error).message ?? "processing error" },
      { status: 500 },
    );
  }
}
