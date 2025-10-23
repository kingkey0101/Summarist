"use client";

import { useState } from "react";

export default function Search() {
  const [query, setQuery] = useState("");

  return (
    <div className="w-[340px]">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for books"
          className="h-10 w-[340px] px-4 pr-12 py-0 outline-none  border-gray-300 rounded-md  bg-[#f1f6f4] text-[#042330] border-2 border-[#e1e7ea]focus:outline-none"
          aria-label="Search for books"
        />

        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
          <div className="h-8 border-l border-[#e1e7ea] pl-3 flex items-center"></div>
          <svg
            role="img"
            aria-label="search"
            stroke="currentColor"
            className="w-6 h-6"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 1024 1024"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0 0 11.6 0l43.6-43.5a8.2 8.2 0 0 0 0-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"></path>
          </svg>
        </div>
      </div>
    </div>
  );
}
