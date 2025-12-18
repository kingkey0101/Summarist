"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import PremiumBadge from "./PremiumBadge";

type Book = {
  id: string;
  title: string;
  subTitle?: string;
  imageLink?: string;
  author?: string;
  subscriptionRequired?: boolean;
  type?: string;
};

export default function SelectedForYou({
  apiUrl = process.env.NEXT_PUBLIC_SELECTED_API_URL ?? "/api/recommendation",
}: {
  apiUrl: string;
}) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchOne() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (mounted && Array.isArray(data) && data[0]) {
          setBook(data[0]);
        } else if (mounted && data) {
          setBook(data as Book);
        }
      } catch (err: unknown) {
        setError((err as Error)?.message ?? "Failed");
      } finally {
        setLoading(false);
      }
    }
    fetchOne();
    return () => {
      mounted = false;
    };
  }, [apiUrl]);

  if (loading && !book)
    return (
      <section className="my-6 flex-1 pt-16">
        <div className="max-w-[681px]">
          <div className="animate-pulse rounded-lg bg-gray-100 h-44" />
        </div>
      </section>
    );

  if (!book) return null;

  return (
    <section className="my-6 flex-1 pt-16">
      <h2 className="font-semibold text-[22px] mb-3 text-left">
        Selected just for you
      </h2>

      <div className="bg-[#fbefd6] flex flex-col md:flex-row items-stretch p-6 gap-6 rounded-lg shadow-sm max-w-[681px] w-full">
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
            {book.title}
          </h3>
          <div className="text-sm md:text-base text-gray-600 mb-3">
            {book.author}
          </div>
          {book.subTitle ? (
            <p className="text-sm md:text-base text-gray-700 mb-4 leading-relaxed">
              {book.subTitle}
            </p>
          ) : null}

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              aria-label="Play audio summary"
            >
              <svg
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              3 mins 23 secs
            </button>
          </div>
        </div>

        <div className="flex-shrink-0 w-full md:w-[140px] h-[180px] md:h-auto rounded overflow-hidden bg-white relative">
          <div className="absolute top-1 right-1 z-10">
            <PremiumBadge
              bookType={book.type}
              subscriptionRequired={book.subscriptionRequired}
              className="text-xs"
            />
          </div>
          {book.imageLink ? (
            <Image
              src={book.imageLink}
              alt={book.title}
              width={140}
              height={180}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>
      </div>
    </section>
  );
}
