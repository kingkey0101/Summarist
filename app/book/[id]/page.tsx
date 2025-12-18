import Image from "next/image";
import type { JSX } from "react";
import BookActions from "@/app/components/BookActions";
import Nav from "@/app/components/Nav";
import PremiumAccessGuard from "@/app/components/PremiumAccessGuard";
import PremiumBadge from "@/app/components/PremiumBadge";
import type { BookDetail } from "@/lib/BookDetail";

async function fetchBookById(
  apiBase: string | undefined,
  id: string,
): Promise<BookDetail | null> {
  if (!apiBase) return null;

  try {
    let _decoded: string;
    try {
      _decoded = decodeURIComponent(apiBase);
    } catch {
      _decoded = apiBase;
    }

    let detailUrl = _decoded.replace(
      /\$\{id\}|\{id\}/g,
      encodeURIComponent(id),
    );
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
          return Array.isArray(json) ? (json[0] ?? null) : json;
        } catch (err) {
          console.warn(
            "detail endpoint returned invalid JSON: falling back to list",
            err,
          );
        }
      } else {
        console.warn(
          "detail endpoint returned empty body, falling back to list",
          detailUrl,
        );
      }
    } else {
      console.warn(
        "detail endpoint request failed, falling back to list",
        detailUrl,
        res.status,
      );
    }

    res = await fetch(apiBase, { cache: "no-store" });
    if (!res.ok) {
      console.warn("list endpoint request failed", apiBase, res.status);
      return null;
    }
    const listText = await res.text();
    if (!listText || !listText.trim()) {
      console.warn("list endpoint returned empty body", apiBase);
      return null;
    }

    let data: unknown;
    try {
      data = JSON.parse(listText);
    } catch (err) {
      console.warn("list endpoint returned invalid JSON", err);
      return null;
    }

    const list: BookDetail[] = Array.isArray(data)
      ? (data as BookDetail[])
      : (() => {
          if (typeof data === "object" && data !== null) {
            const maybeItems = (data as Record<string, unknown>).items;
            if (Array.isArray(maybeItems)) {
              return maybeItems as BookDetail[];
            }
          }
          return [data as BookDetail];
        })();

    return list.find((b: BookDetail) => String(b.id) === String(id)) ?? null;
  } catch (err) {
    console.error("fetchBookById error:", err);
    return null;
  }
}

export default async function Page(props: unknown): Promise<JSX.Element> {
  const paramsCandidate = (
    props as {
      params?: { id: string } | Promise<{ id: string }>;
    }
  )?.params;
  const { id } = (paramsCandidate ? await paramsCandidate : { id: "" }) as {
    id: string;
  };

  const rawBookApi = process.env.NEXT_PUBLIC_BOOK_ID_API_URL;

  const apiBase = rawBookApi ?? undefined;
  const book = await fetchBookById(apiBase, id);

  // console.debug("fetched book payload:", JSON.stringify(book ?? {}, null, 2));
  const rawKeyIdeas = (book as BookDetail)?.keyIdeas;
  type RawIdeas = unknown;
  const normalizeIdea = (it: RawIdeas): string | null => {
    if (it === null) return null;
    if (typeof it === "string") return it.trim() || null;
    if (typeof it === "number" || typeof it === "boolean") return String(it);
    if (typeof it === "object") {
      if (Array.isArray(it)) return null;
      const obj = it as Record<string, unknown>;
      const candidateKeys = ["text", "value", "idea", "label", "description"];
      for (const k of candidateKeys) {
        const v = obj[k];
        if (typeof v === "string" && v.trim()) return v.trim();
      }
      try {
        const s = JSON.stringify(it);
        return s === "{" ? null : s;
      } catch {
        return null;
      }
    }
    return null;
  };

  if (!book) {
    return (
      <main className="p-8 md:pl-52">
        <div className="max-w-3xl mx-auto text-center py-20">
          <h1 className="text-2xl font-semibold">Book not found</h1>
          <p className="mt-3 text-gray-600">No data for id: {id}</p>
        </div>
      </main>
    );
  }

  const keyIdeas: string[] = Array.isArray(rawKeyIdeas)
    ? (rawKeyIdeas.map(normalizeIdea).filter(Boolean) as string[])
    : typeof rawKeyIdeas === "string"
      ? rawKeyIdeas
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean)
      : rawKeyIdeas
        ? ([normalizeIdea(rawKeyIdeas)].filter(Boolean) as string[])
        : [];

  return (
    <>
      <Nav />
      <PremiumAccessGuard book={book}>
        <main className="min-h-screen bg-gray-50 p-4 md:p-8 md:pl-56">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg p-4 md:p-6 lg:p-8 flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8 items-start">
              <div className="flex-1 relative">
                <div className="flex items-start gap-3 mb-2">
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#032b41] leading-tight flex-1">
                    {book.title}
                  </h1>
                  <PremiumBadge
                    bookType={book.type}
                    subscriptionRequired={book.subscriptionRequired}
                    className="mt-1"
                  />
                </div>
                <div className="mt-2 text-sm md:text-base">
                  <strong>{book.author ?? "Unknown"}</strong>
                </div>
                {book.subTitle && (
                  <div className="text-sm md:text-base lg:text-lg text-gray-500 mt-2 pb-3">
                    {book.subTitle}
                  </div>
                )}
                <hr
                  aria-hidden
                  className="border-t border-gray-200 my-4 md:my-6"
                />

                {/* left */}
                <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-12">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      {typeof book.averageRating !== "undefined" && (
                        <div className="flex items-center gap-2">
                          <svg
                            role="img"
                            aria-label="rating"
                            className="w-6 h-6 shrink-0"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 1024 1024"
                          >
                            <path d="M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 0 0 .6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0 0 46.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3zM664.8 561.6l36.1 210.3L512 672.7 323.1 772l36.1-210.3-152.8-149L417.6 382 512 190.7 606.4 382l211.2 30.7-152.8 148.9z"></path>
                          </svg>

                          {book.averageRating.toFixed(1)}
                          {typeof book.totalRating !== "undefined" && (
                            <div>({book.totalRating})</div>
                          )}
                        </div>
                      )}
                      {keyIdeas.length > 0 && (
                        <div className="flex items-center gap-2 ml-4 md:ml-12">
                          <svg
                            role="img"
                            aria-label="ideas"
                            className="w-6 h-6 shrink-0"
                            xmlns="http://www.w3.org/2000/svg"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            ></path>
                          </svg>
                          {keyIdeas.map((k, i) => (
                            <div
                              className="inline-block"
                              key={`${i}-${String(k).slice(0, 40)}`}
                            >
                              {k}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* right */}
                <div className="absolute items-center gap-2 pt-2">
                  {book.type && (
                    <div className="flex items-center ">
                      <svg
                        role="img"
                        aria-label="rating"
                        className="w-6 h-6 shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        stroke="currentColor"
                        fill="currentColor"
                        viewBox="0 0 1024 1024"
                      >
                        <path d="M842 454c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8 0 140.3-113.7 254-254 254S258 594.3 258 454c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8 0 168.7 126.6 307.9 290 327.6V884H326.7c-13.7 0-24.7 14.3-24.7 32v36c0 4.4 2.8 8 6.2 8h407.6c3.4 0 6.2-3.6 6.2-8v-36c0-17.7-11-32-24.7-32H548V782.1c165.3-18 294-158 294-328.1zM512 624c93.9 0 170-75.2 170-168V232c0-92.8-76.1-168-170-168s-170 75.2-170 168v224c0 92.8 76.1 168 170 168zm-94-392c0-50.6 41.9-92 94-92s94 41.4 94 92v224c0 50.6-41.9 92-94 92s-94-41.4-94-92V232z"></path>
                      </svg>
                      {book.type}
                    </div>
                  )}
                </div>
                <div className="pt-4">
                  <hr aria-hidden className="border-t border-gray-200 my-6" />
                </div>
                {/* buttons */}
                <div className="flex gap-4 mb-6">
                  <BookActions book={book} />
                </div>
              </div>

              <div className="shrink-0 flex justify-center items-start mt-4 md:mt-0">
                <div className="relative w-40 h-40 md:w-72 md:h-72">
                  <Image
                    src={book.imageLink ?? "/assets/window.svg"}
                    alt={book.title}
                    fill
                    style={{ objectFit: "contain" }}
                    sizes="(max-width: 768px) 160px, 288px"
                    priority
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-6 bg-white rounded-md p-4 md:p-6 text-center">
              {book.bookDescription && (
                <div className="prose max-w-none mx-auto text-left">
                  <h3 className="text-lg font-semibold mb-2">About the book</h3>
                  {book.tags && book.tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2 justify-start">
                      {book.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[15px] px-3 py-1 rounded-sm bg-[#f1f6f4] text-[#032b41] w-[205px] h-12 flex items-center font-semibold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-gray-700">{book.bookDescription}</p>
                </div>
              )}

              {book.authorDescription && (
                <div className="prose max-w-none mx-auto text-left mt-6">
                  <h3 className="text-lg font-semibold mb-2">
                    About the author
                  </h3>
                  <p className="text-gray-700">{book.authorDescription}</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </PremiumAccessGuard>
    </>
  );
}
