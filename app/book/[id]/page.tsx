import Image from "next/image";
import type { JSX } from "react";

type BookDetail = {
  id: string;
  title: string;
  subTitle?: string;
  author?: string;
  imageLink?: string;
  averageRating?: number;
  totalRating?: number;
  type?: string;
  keyIdeas?: string[];
  tags?: string[];
  bookDescription?: string;
  authorDescription?: string;
};

async function fetchBookById(
  apiBase: string | undefined,
  id: string,
): Promise<BookDetail | null> {
  if (!apiBase) return null;

  try {
    const decoded = decodeURIComponent(apiBase);
    const hasPlaceholder = /\$\{id\}|\{id\}/.test(decoded);
    const detailUrl = hasPlaceholder
      ? apiBase.replace(/\$\{id\}|\{id\}/g, encodeURIComponent(id))
      : `${apiBase}${apiBase.includes("?") ? "&" : "?"}id=${encodeURIComponent(
          id,
        )}`;

    let res = await fetch(detailUrl, { cache: "no-store" });
    if (res.ok) {
      const text = await res.text();
      if (text?.trim()) {
        try {
          const json = JSON.parse(text);
          return Array.isArray(json) ? (json[0] ?? null) : json;
        } catch (err) {
          console.warn(
            "detail endpoint returned non-JSON, falling back to list",
            err,
          );
        }
      } else {
        console.warn(
          "detail endpoint returned empty body, falling back to list",
        );
      }
    }

    res = await fetch(apiBase, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const list: BookDetail[] = Array.isArray(data)
      ? data
      : Array.isArray(data.items)
        ? data.items
        : [data];
    return list.find((b) => String(b.id) === String(id)) ?? null;
  } catch (err) {
    console.error("fetchBookById error:", err);
    return null;
  }
}

export default async function Page(props: unknown): Promise<JSX.Element> {
  const { params } = (props as { params?: { id: string } }) ?? {};
  const { id } = params ?? { id: "" };

  const rawBookApi =
    process.env.NEXT_PUBLIC_BOOK_ID_API_URL ??
    process.env.NEXT_PUBLIC_RECOMMENDATION_API_URL ??
    process.env.NEXT_PUBLIC_SELECTED_API_URL;

  const apiBase = rawBookApi ?? undefined;
  const book = await fetchBookById(apiBase, id);

  if (!book) {
    return (
      <main className="p-8 md:ml-64">
        <div className="max-w-3xl mx-auto text-center py-20">
          <h1 className="text-2xl font-semibold">Book not found</h1>
          <p className="mt-3 text-gray-600">No data for id: {id}</p>
        </div>
      </main>
    );
  }

  const keyIdeas = book.keyIdeas ?? [];

  return (
    <main className="p-8 md:ml-64">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-md p-6 flex gap-6 items-start">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#032b41]">{book.title}</h1>
            {book.subTitle && (
              <div className="text-sm text-gray-600 mt-1">{book.subTitle}</div>
            )}

            <div className="mt-3 text-sm text-gray-700 space-y-1">
              <div>
                <strong>Author:</strong> {book.author ?? "Unknown"}
              </div>
              {typeof book.averageRating !== "undefined" && (
                <div>
                  <strong>Average rating:</strong>{" "}
                  {book.averageRating.toFixed(1)}
                </div>
              )}
              {typeof book.totalRating !== "undefined" && (
                <div>
                  <strong>Total ratings:</strong> {book.totalRating}
                </div>
              )}
              {book.type && (
                <div>
                  <strong>Type:</strong> {book.type}
                </div>
              )}
            </div>

            {keyIdeas.length > 0 && (
              <div className="mt-4">
                <div className="font-semibold mb-2">Key ideas</div>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {keyIdeas.map((k, i) => (
                    <li key={`${i}-${String(k).slice(0, 40)}`}>{k}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="w-[180px] flex-shrink-0 flex justify-center items-start">
            <div className="relative w-[140px] h-[200px] rounded-sm overflow-hidden">
              <Image
                src={book.imageLink ?? "/assets/window.svg"}
                alt={book.title}
                fill
                style={{ objectFit: "cover" }}
                sizes="180px"
                priority
              />
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-md p-6 text-center">
          {book.tags && book.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2 justify-center">
              {book.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {book.bookDescription && (
            <div className="prose max-w-none mx-auto text-left">
              <h3 className="text-lg font-semibold mb-2">About the book</h3>
              <p className="text-gray-700">{book.bookDescription}</p>
            </div>
          )}

          {book.authorDescription && (
            <div className="prose max-w-none mx-auto text-left mt-6">
              <h3 className="text-lg font-semibold mb-2">About the author</h3>
              <p className="text-gray-700">{book.authorDescription}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
