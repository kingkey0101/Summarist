import { BookDetail } from "@/lib/BookDetail";
import { JSX } from "react";

async function fetchBookById(
  apiBase: string | undefined,
  id: string
): Promise<BookDetail | null> {
  if (!apiBase) return null;

  try {
    let _decoded: string;
    try {
      _decoded = decodeURIComponent(apiBase);
    } catch {
      _decoded = apiBase;
    }
    let detailUrl = _decoded.replace(/\$\{id}|{id\}/g, encodeURIComponent(id));
    if (detailUrl === _decoded) {
      detailUrl = `${_decoded}${
        _decoded.includes("?") ? "&" : "?"
      }id=${encodeURIComponent(id)}`;
    }
    let res = await fetch(detailUrl, { cache: "no-store" });
    if (res.ok) {
      const text = await res.text();
      if (text?.trim()) {
        try {
          const json = JSON.parse(text);
          return Array.isArray(json) ? json[0] ?? null : (json as BookDetail);
        } catch (err) {
          return null;
        }
      }
    }

    res = await fetch(apiBase, { cache: "no-store" });
    if (!res.ok) return null;
    const listText = await res.text();
    if (!listText || !listText.trim()) return null;
    let data: unknown;
    try {
      data = JSON.parse(listText);
    } catch {
      return null;
    }

    const list: BookDetail[] = Array.isArray(data)
      ? (data as BookDetail[])
      : (() => {
          if (typeof data === "object" && data !== null) {
            const maybeItems = (data as Record<string, unknown>).items;
            if (Array.isArray(maybeItems)) return maybeItems as BookDetail[];
          }
          return [data as BookDetail];
        })();
    return list.find((b) => String(b.id) === String(id)) ?? null;
  } catch (err) {
    console.error("player.fetchBookById error:", err);
    return null;
  }
}

export default async function PlayerPage({
  params,
}: {
  params: { id: string };
}): Promise<JSX.Element> {
  const { id } = params;
  const apiBase = process.env.NEXT_PUBLIC_BOOK_ID_API_URL ?? undefined;
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

  const summary = book.summary ?? "No summary available.";

  return (
    <main className="p-8 md:ml-64">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-md p-6">
          <h1 className="text-2xl font-black text-[#032b41]">{book.title}</h1>
          {book.author && (
            <div className="mt-2 text-sm text-gray-600">{book.author}</div>
          )}

          <hr className="border-t border-gray-200 my-6" />

          <section className="prose max-w-none text-left">
            <h2 className="text-lg font-semibold mb-2">Summary</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>
          </section>
          <div className="mt-6">
            <p className="text-sm text-gray-500">
              Player UI and Audio controls will be implemented later.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
