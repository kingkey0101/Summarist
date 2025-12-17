"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Book = {
  id: string;
  title?: string;
  author?: string;
};

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    // clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    if (!query.trim()) {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = window.setTimeout(() => {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      const ac = new AbortController();
      abortRef.current = ac;

      const url = `https://us-central1-summaristt.cloudfunctions.net/getBooksByAuthorOrTitle?search=${encodeURIComponent(
        query,
      )}`;

      fetch(url, { signal: ac.signal })
        .then(async (res) => {
          if (!res.ok) throw new Error("Search request failed");
          const data = await res.json();
          // API may return array or object with items
          type SearchResponse = { items?: unknown[] } | unknown[];
          const searchData = data as SearchResponse;
          const list: unknown[] = Array.isArray(searchData)
            ? searchData
            : Array.isArray(searchData.items)
              ? searchData.items
              : [searchData];
          setResults(
            (list || []).slice(0, 8).map((it: unknown) => {
              const item = it as Record<string, unknown>;
              return {
                id: String(item.id ?? item.bookId ?? item._id ?? item.id),
                title: String(item.title ?? item.name ?? ""),
                author: String(
                  item.author ??
                    item.authors ??
                    (item.by ? String(item.by) : ""),
                ),
              };
            }),
          );
          setOpen(true);
        })
        .catch((err: unknown) => {
          const error = err as { name?: string };
          if (error.name !== "AbortError") console.error("Search error", err);
          setResults([]);
        })
        .finally(() => {
          setLoading(false);
          abortRef.current = null;
        });
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [query]);

  return (
    <div ref={containerRef} className="relative w-full max-w-[420px]">
      <label htmlFor="search-input" className="sr-only">
        Search for books
      </label>
      <input
        id="search-input"
        aria-label="Search for books"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (results.length) setOpen(true);
        }}
        placeholder="Search by title or author"
        className="h-10 w-full px-4 pr-12 py-0 outline-none border-gray-300 rounded-md bg-[#f1f6f4] text-[#042330] border-2 focus:outline-none"
      />
      <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
        {loading ? (
          <svg
            className="w-5 h-5 animate-spin text-gray-500"
            viewBox="0 0 24 24"
            role="img"
            aria-label="Loading"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              opacity="0.25"
            />
            <path
              d="M22 12a10 10 0 0 1-10 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        ) : (
          <svg
            stroke="currentColor"
            className="w-5 h-5"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Search"
          >
            <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0 0 11.6 0l43.6-43.5a8.2 8.2 0 0 0 0-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"></path>
          </svg>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md max-h-64 overflow-auto divide-y">
          {results.map((r) => (
            <li key={r.id} className="px-3 py-2 hover:bg-gray-50">
              <Link
                href={`/book/${encodeURIComponent(r.id)}`}
                onClick={() => setOpen(false)}
                className="block"
              >
                <div className="text-sm font-medium text-gray-900">
                  {r.title || "Untitled"}
                </div>
                <div className="text-xs text-gray-500">
                  {r.author || "Unknown author"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {open && !results.length && !loading && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md px-3 py-2 text-sm text-gray-500">
          No results
        </div>
      )}
    </div>
  );
}
