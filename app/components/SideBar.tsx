"use client";

import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebaseClient";

const mainMenuItems = [
  {
    name: "For you",
    href: "/for-you",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        aria-label="Home"
        role="img"
      >
        <path
          d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="9,22 9,12 15,12 15,22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "My Library",
    href: "/my-library",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        aria-label="Library"
        role="img"
      >
        <path
          d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Highlights",
    href: "/highlights",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        aria-label="Highlights"
        role="img"
      >
        <path
          d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Search",
    href: "/search",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        aria-label="Search"
        role="img"
      >
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
        <path
          d="21 21l-4.35-4.35"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const bottomMenuItems = [
  {
    name: "Settings",
    href: "/settings",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        aria-label="Settings"
        role="img"
      >
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        <path
          d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    name: "Help & Support",
    href: "/help",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        aria-label="Help"
        role="img"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path
          d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="12"
          y1="17"
          x2="12.01"
          y2="17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function SideBar() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    function onToggle() {
      setOpen((v) => !v);
    }
    function onClose() {
      setOpen(false);
    }
    window.addEventListener("toggle-sidebar", onToggle as EventListener);
    window.addEventListener("close-sidebar", onClose as EventListener);
    return () => {
      window.removeEventListener("toggle-sidebar", onToggle as EventListener);
      window.removeEventListener("close-sidebar", onClose as EventListener);
    };
  }, []);

  async function handleLogout() {
    const auth = getFirebaseAuth();
    if (!auth) {
      console.warn("Auth not available");
      if (typeof window !== "undefined")
        window.dispatchEvent(new CustomEvent("close-sidebar"));
      return;
    }
    try {
      await signOut(auth);
      window.dispatchEvent(new CustomEvent("close-sidebar"));
      router.push("/");
    } catch (err) {
      console.warn("signOut failed", err);
    }
  }

  function handleLogin() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-auth-modal"));
      window.dispatchEvent(new CustomEvent("close-sidebar"));
    }
  }

  // Desktop sidebar (md+) rendered fixed; mobile uses off-canvas
  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-52 md:flex md:flex-col bg-[#f7faf9] text-black z-20">
        <div className="p-4 pb-6">
          <Link href="/">
            <Image
              src="/assets/logo.png"
              alt="Summarist logo"
              width={120}
              height={32}
              className="h-8 w-auto object-contain"
            />
          </Link>
        </div>

        <nav className="px-4 flex-grow">
          <div className="space-y-1">
            {mainMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 py-3 px-3 rounded-lg text-sm font-medium transition-colors relative ${
                  pathname === item.href
                    ? "text-gray-900 bg-gray-50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {pathname === item.href && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2bd97c] rounded-r"></div>
                )}
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-1">
          {bottomMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 py-3 px-3 rounded-lg text-sm font-medium transition-colors relative ${
                pathname === item.href
                  ? "text-gray-900 bg-gray-50"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {pathname === item.href && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2bd97c] rounded-r"></div>
              )}
              {item.icon}
              {item.name}
            </Link>
          ))}

          <button
            type="button"
            className="flex items-center gap-3 py-3 px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors w-full"
            onClick={user ? handleLogout : handleLogin}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              aria-label={user ? "Logout" : "Login"}
              role="img"
            >
              <path
                d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points={user ? "16,17 21,12 16,7" : "16,17 21,12 16,7"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="21"
                y1="12"
                x2="9"
                y2="12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {user ? "Log out" : "Log in"}
          </button>
        </div>
      </aside>

      {/* Mobile off-canvas */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="relative w-72 max-w-full bg-white overflow-auto flex flex-col">
            <div className="p-4 pb-6 flex items-center justify-between border-b">
              <Image
                src="/assets/logo.png"
                alt="Summarist logo"
                width={120}
                height={32}
                className="h-8 w-auto object-contain"
              />
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-label="Close menu"
                  role="img"
                >
                  <line
                    x1="18"
                    y1="6"
                    x2="6"
                    y2="18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="6"
                    y1="6"
                    x2="18"
                    y2="18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <nav className="flex-1 p-4">
              <div className="space-y-1">
                {mainMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 py-3 px-3 rounded-lg text-sm font-medium transition-colors relative ${
                      pathname === item.href
                        ? "text-gray-900 bg-gray-50"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {pathname === item.href && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2bd97c] rounded-r"></div>
                    )}
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="p-4 pt-16 border-t border-gray-200 space-y-1">
              {bottomMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 py-3 px-3 rounded-lg text-sm font-medium transition-colors relative ${
                    pathname === item.href
                      ? "text-gray-900 bg-gray-50"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {pathname === item.href && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2bd97c] rounded-r"></div>
                  )}
                  {item.icon}
                  {item.name}
                </Link>
              ))}

              <button
                type="button"
                className="flex items-center gap-3 py-3 px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors w-full"
                onClick={() => {
                  setOpen(false);
                  if (user) {
                    handleLogout();
                  } else {
                    handleLogin();
                  }
                }}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-label={user ? "Logout" : "Login"}
                  role="img"
                >
                  <path
                    d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="16,17 21,12 16,7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="21"
                    y1="12"
                    x2="9"
                    y2="12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {user ? "Log out" : "Log in"}
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
