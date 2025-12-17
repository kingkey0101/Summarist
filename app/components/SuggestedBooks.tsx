"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Book = {
  id: string;
  title?: string;
  author?: string;
  imageLink?: string;
  subTitle?: string;
  subscriptionRequired?: boolean;
  averageRating?: number;
  totalRating?: number;
  audioLink?: string;
};

export default function SuggestedBooks({
  apiUrl = process.env.NEXT_PUBLIC_SUGGESTED_API_URL ??
    "/api/recommendation?type=suggested&limit=5",
}: {
  apiUrl: string;
}) {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchList() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (!mounted) return;
        setBooks(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        setError((err as Error)?.message ?? "Failed");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchList();
    return () => {
      mounted = false;
    };
  }, [apiUrl]);

  if (loading && books.length === 0)
    return (
      <section className="my-6">
        <div className="h-28 bg-gray-100 rounded" />
      </section>
    );

  if (books.length === 0) return <div className="my-6">No suggestions</div>;

  return (
    <section className="my-6">
      <h2 className="font-semibold text-[22px] mb-2 text-left">
        Suggested books
      </h2>
      <h4 className="text-[16px] text-gray-500 mb-3">Browse these books</h4>

      {/* Desktop: Grid layout, Mobile: Horizontal scroll */}
      <div className="md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4 md:static">
        <div className="md:hidden overflow-x-auto -mx-4 px-4 snap-x snap-mandatory">
          <div className="flex gap-4 w-max">
            {books.map((b) => (
              <button
                key={String(b.id)}
                type="button"
                onClick={() =>
                  router.push(`/book/${encodeURIComponent(String(b.id))}`)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    router.push(`/book/${encodeURIComponent(String(b.id))}`);
                }}
                className="snap-start shrink-0 w-64 bg-white rounded-lg p-4 shadow-sm cursor-pointer focus:outline-none text-left"
              >
                <div className="w-full h-40 bg-gray-100 rounded overflow-hidden mb-3 flex items-center justify-center relative">
                  {b.subscriptionRequired && (
                    <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded-full z-10">
                      Premium
                    </div>
                  )}
                  {b.imageLink ? (
                    <Image
                      src={b.imageLink}
                      alt={b.title ?? "Book cover"}
                      width={200}
                      height={160}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : null}
                </div>
                <div className="space-y-2">
                  <div className="text-base font-bold truncate text-gray-900">
                    {b.title}
                  </div>
                  <div className="text-sm text-gray-600">{b.author}</div>
                  {b.subTitle && (
                    <div className="text-sm text-gray-700 line-clamp-2">
                      {b.subTitle}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-500">03:18</div>
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4 fill-yellow-400"
                        viewBox="0 0 20 20"
                        aria-label="Star rating"
                        role="img"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-gray-700">
                        {b.averageRating?.toFixed(1) || "4.3"}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:contents">
          {books.map((b) => (
            <button
              key={String(b.id)}
              type="button"
              onClick={() =>
                router.push(`/book/${encodeURIComponent(String(b.id))}`)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  router.push(`/book/${encodeURIComponent(String(b.id))}`);
              }}
              className="bg-white rounded-lg p-4 shadow-sm cursor-pointer focus:outline-none text-left"
            >
              <div className="w-full h-40 bg-gray-100 rounded overflow-hidden mb-3 flex items-center justify-center relative">
                {b.subscriptionRequired && (
                  <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded-full z-10">
                    Premium
                  </div>
                )}
                {b.imageLink ? (
                  <Image
                    src={b.imageLink}
                    alt={b.title ?? "Book cover"}
                    width={200}
                    height={160}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : null}
              </div>
              <div className="space-y-2">
                <div className="text-base font-bold truncate text-gray-900">
                  {b.title}
                </div>
                <div className="text-sm text-gray-600">{b.author}</div>
                {b.subTitle && (
                  <div className="text-sm text-gray-700 line-clamp-2">
                    {b.subTitle}
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-500">03:18</div>
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4 fill-yellow-400"
                      viewBox="0 0 20 20"
                      aria-label="Star rating"
                      role="img"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-gray-700">
                      {b.averageRating?.toFixed(1) || "4.3"}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
