"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import LoginButton from "./LoginButton";
import Search from "./Search";

export default function Nav() {
  const pathname = usePathname() ?? "/";
  const isHomePage = pathname === "/";
  const hideSearch = pathname === "/" || pathname.startsWith("/choose-plan");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape")
        window.dispatchEvent(new CustomEvent("close-sidebar"));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function openSidebar() {
    window.dispatchEvent(new CustomEvent("toggle-sidebar"));
  }

  if (isHomePage) {
    // Home page navigation matching the screenshot
    return (
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/logo.png"
                alt="Summarist"
                width={180}
                height={32}
                priority
              />
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8">
              <LoginButton className="text-gray-600 hover:text-gray-900 font-medium">
                Login
              </LoginButton>
              <a
                href="/about"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                About
              </a>
              <a
                href="/contact"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Contact
              </a>
              <a
                href="/help"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Help
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <LoginButton className="text-gray-600 hover:text-gray-900 font-medium">
                Login
              </LoginButton>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Regular navigation for other pages
  return (
    <nav className="nav h-20">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          {/* Mobile hamburger: shown on small screens to open sidebar */}
          <button
            type="button"
            aria-label="Open menu"
            className="md:hidden p-2 rounded hover:bg-gray-100 text-black z-50"
            onClick={openSidebar}
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              role="img"
              aria-label="Menu"
            >
              <path
                d="M3 6h18M3 12h18M3 18h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Search bar positioned on the right - visible on all screen sizes */}
          {!hideSearch && (
            <div className="flex-1 max-w-xs">
              <Search />
            </div>
          )}

          {/* Only show Sign in button if user is not logged in */}
          {!user && (
            <div className="hidden md:block">
              <LoginButton>Sign in</LoginButton>
            </div>
          )}

          {!user && (
            <div className="md:hidden">
              <LoginButton className="px-2 py-1 text-sm">Sign in</LoginButton>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
