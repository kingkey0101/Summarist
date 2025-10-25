"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Book = {
  id: string;
  title: string;
  subTitle?: string;
  imageLink?: string;
  author?: string;
  subscriptionRequired?: boolean;
  averageRating?: number;
};
export default function SuggestedBooks({
  apiUrl = process.env.NEXT_PUBLIC_SUGGESTED_API_UR ??
    "/api/recommendation?type=suggested&limit=5",
}: {
  apiUrl: string;
}) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchList() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list: Book[] = Array.isArray(data)
          ? data
          : Array.isArray(data.items)
          ? data.items
          : [data];
        if (mounted) setBooks(list.slice(0, 5));
      } catch (err: unknown) {
        if (mounted) setError((err as Error)?.message ?? "Failed");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchList();
    return () => {
      mounted = false;
    };
  }, [apiUrl]);

  if (loading && books.length === 0) return <div>Loading suggestions…</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (books.length === 0) return <div>No suggestions</div>;

  return (
    <section className="my-6">
      <h2
        className="font-semibold text-[22px] mb-3"
        style={{ textAlign: "left" }}
      >
        Suggested books
      </h2>
      <h4 className="text-[16px] text-gray-500">Browse these books</h4>

      <div className="flex gap-11 overflow-none py-8">
        {books.map((b) => (
          <article
            key={b.id}
            className="p-3 w-[190px] shrink-0 max-w-[190px] max-h-[356px] hover:bg-gray-200 cursor-pointer"
          >
            <div className="flex items-end justify-end mt-2 pb-4">
              {b.subscriptionRequired && (
                <div className="text-xs bg-gray-800 px-2 py-0.5 rounded-3xl text-white">
                  Premium
                </div>
              )}
            </div>
            <div className="relative w-full h-40 mb-3 lg:w-[172px] lg:h-[172px]">
              <Image
                src={b.imageLink ?? "no books loaded"}
                alt="b.title"
                fill
                style={{ objectFit: "cover" }}
                sizes="160px"
                priority={false}
              />
            </div>
            <div className="text-[16px] font-semibold ">{b.title}</div>
            <div className="text-sm text-gray-500">{b.author}</div>
            <div className="text-sm mt-1 text-black">{b.subTitle}</div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-gray-600">
                {b.averageRating ? `${b.averageRating.toFixed(1)} ★` : "-"}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
