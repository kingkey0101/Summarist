"use client";

import {
  collection,
  type DocumentData,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore/lite";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebaseClient";
// import SideBar from "../components/SideBar";
import Skeleton from "../components/Skeleton";

type Book = {
  id: string;
  title?: string;
  author?: string | null;
  imageLink?: string | null;
  subTitle?: string | null;
  addedAt?: string | null;
  finishedAt?: string | null;
};

export default function MyLibraryPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<Book[]>([]);
  const [finished, setFinished] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setUserId(null);
      setLoading(false);
      return;
    }
    const unsub = auth.onAuthStateChanged((u) => {
      setUserId(u?.uid ?? null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadLists(uid: string) {
      setLoading(true);
      setError(null);
      try {
        const db = getFirebaseDb();
        if (!db) {
          if (mounted) setError("Unable to initialize Firestore.");
          return;
        }

        const libCol = collection(db, "users", uid, "library");
        const libQ = query(libCol, orderBy("addedAt", "desc"));
        const libSnap = await getDocs(libQ);
        const libs: Book[] = libSnap.docs.map((d) => {
          const data = d.data() as DocumentData;
          return {
            id: String(d.id),
            title: data.title ?? data.name ?? "Untitled",
            author: data.author ?? null,
            imageLink: data.imageLink ?? null,
            subTitle: data.subTitle ?? null,
            addedAt: data.addedAt ? String(data.addedAt) : null,
          };
        });

        const finCol = collection(db, "users", uid, "finished");
        const finQ = query(finCol, orderBy("finishedAt", "desc"));
        const finSnap = await getDocs(finQ);
        const fins: Book[] = finSnap.docs.map((d) => {
          const data = d.data() as DocumentData;
          return {
            id: String(d.id),
            title: data.title ?? data.name ?? "Untitled",
            author: data.author ?? null,
            imageLink: data.imageLink ?? null,
            finishedAt: data.finishedAt ? String(data.finishedAt) : null,
          };
        });

        if (!mounted) return;
        setSaved(libs);
        setFinished(fins);
        setError(null);
      } catch (err: unknown) {
        console.error("load library error", err);
        const error = err as { code?: string; message?: string };
        const maybeCode = error.code ?? error.message ?? String(err);
        if (String(maybeCode).toLowerCase().includes("permission")) {
          setError(
            "Permission denied: can't read your library. Sign in or update your Firestore rules.",
          );
        } else {
          setError(
            typeof err === "string"
              ? err
              : ((err as Error)?.message ?? "Unknown error"),
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (userId) {
      loadLists(userId);
    } else {
      setSaved([]);
      setFinished([]);
      setError(null);
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [userId]);

  function openLogin() {
    window.dispatchEvent(new CustomEvent("open-auth-modal"));
  }

  function openBook(id: string) {
    router.push(`/book/${encodeURIComponent(id)}`);
  }

  function playBook(id: string) {
    router.push(`/player/${encodeURIComponent(id)}`);
  }

  if (!userId) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 md:p-8 md:pl-56">
        {/* <SideBar /> */}
        <div className="max-w-3xl mx-auto text-center py-12 md:py-20">
          <Image
            src="/assets/login.png"
            alt="Login"
            width={192}
            height={192}
            className="mx-auto mb-6 w-32 h-32 md:w-48 md:h-48 object-contain"
          />
          <h2 className="text-xl md:text-2xl font-semibold mb-2">My Library</h2>
          <p className="text-sm md:text-base text-gray-500 mb-6">
            Sign in to see your saved and finished books.
          </p>
          <button
            type="button"
            onClick={openLogin}
            className="bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition-colors"
          >
            Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 md:pl-56">
      {/* <SideBar /> */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">
          My Library
        </h1>

        {error ? (
          <div className="mb-6 p-4 rounded border border-red-200 bg-red-50 text-red-800">
            <div className="mb-2">{error}</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={openLogin}
                className="px-3 py-1 bg-emerald-500 text-white rounded"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-3 py-1 bg-gray-100 rounded"
              >
                Retry
              </button>
            </div>
          </div>
        ) : null}

        <section className="mb-8">
          <h2 className="text-lg md:text-xl font-medium mb-3">Saved titles</h2>
          {loading && saved.length === 0 ? (
            <div className="grid grid-cols-1 gap-4">
              <Skeleton height={84} />
              <Skeleton height={84} />
            </div>
          ) : saved.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-sm md:text-base text-gray-500">
                No saved books yet.
              </div>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {saved.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center gap-4 p-3 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow"
                >
                  <Image
                    src={b.imageLink ?? "/assets/book-placeholder.png"}
                    alt={b.title ?? "Book cover"}
                    width={64}
                    height={80}
                    className="object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm md:text-base truncate">
                      {b.title}
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 truncate">
                      {b.author}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => openBook(b.id)}
                      className="px-2 py-1 bg-gray-100 rounded text-xs hover:bg-gray-200 transition-colors"
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={() => playBook(b.id)}
                      className="px-2 py-1 bg-emerald-500 text-white rounded text-xs hover:bg-emerald-600 transition-colors"
                    >
                      Play
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-lg font-medium mb-3">Finished books</h2>
          {loading && finished.length === 0 ? (
            <div className="grid grid-cols-1 gap-4">
              <Skeleton height={72} />
              <Skeleton height={72} />
            </div>
          ) : finished.length === 0 ? (
            <div className="text-sm text-gray-500">
              You haven't finished any books yet.
            </div>
          ) : (
            <ul className="space-y-4">
              {finished.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center gap-4 p-3 bg-white rounded-md shadow-sm"
                >
                  <Image
                    src={b.imageLink ?? "/assets/book-placeholder.png"}
                    alt={b.title || "Book Title"}
                    width={56}
                    height={72}
                    className="object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{b.title}</div>
                    <div className="text-sm text-gray-500">{b.author}</div>
                    {b.finishedAt ? (
                      <div className="text-xs text-gray-400 mt-1">
                        Finished: {new Date(b.finishedAt).toLocaleString()}
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => openBook(b.id)}
                      className="px-3 py-1 bg-gray-100 rounded"
                    >
                      Details
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
