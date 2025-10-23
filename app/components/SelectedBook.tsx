"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Book = {
  id: string;
  title: string;
  subTitle: string;
  imageLink: string;
  author: string;
};

export default function SelectedForYou({
  apiUrl = process.env.NEXT_PUBLIC_SELECTED_API_URL ?? "/api/recommendation",
}: {
  apiUrl: string;
}) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchOne() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const b: Book = Array.isArray(data) ? data[0] : data;
        if (mounted) setBook(b ?? null);
      } catch (err: unknown) {
        if (mounted) setError((err as Error)?.message ?? "Failed");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchOne();
    return () => {
      mounted = false;
    };
  }, [apiUrl]);
  //   add loading
  if (loading && !book) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!book) return <div>No recommendations</div>;

  return (
    <section className="my-6 flex-1 pt-16">
      <h2
        className="font-semibold text-[22px] mb-3"
        style={{ textAlign: "left" }}
      >
        Selected just for you
      </h2>

      <div
        className="bg-[#fbefd6] flex items-stretch p-4 gap-4 rounded-lg shadow-sm"
        style={{ width: 681, height: 188 }}
      >
        <div className="w-1/3 pr-4">
          {book.subTitle && (
            <div className="text-black text-[16px] mt-2">{book.subTitle}</div>
          )}
        </div>
        <div className="w-px bg-[#bac8ce] self-stretch" />
        <div className="w-1/3 flex justify-center items-center">
          <div className="relative" style={{ width: 140, height: 140 }}>
            <Image
              src={book.imageLink ?? "/assets/window.svg"}
              alt={book.title}
              fill
              style={{ objectFit: "cover" }}
              sizes="160px"
              priority
            />
          </div>
        </div>
        <div className="flex flex-col items-start -ml-8">
          <div className="font-semibold text-[16px]">{book.title}</div>
          <div className="text-sm ">{book.author}</div>
        </div>
        {/* 
        <div className="w-1/3 flex flex-col items-start gap-3">
          <button
            className="btn"
            onClick={() => window.alert(`Open ${book.title}`)}
          >
            View details
          </button>
        </div> */}
      </div>
    </section>
  );
}
