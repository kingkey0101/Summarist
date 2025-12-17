"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BookDetail } from "@/lib/BookDetail";
import {
  addBookToLibrary,
  getFirebaseApp,
  getFirebaseAuth,
  getUserProfile,
} from "@/lib/firebaseClient";

export default function BookActions({ book }: { book: BookDetail }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  function openAuthModal() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-auth-modal"));
    }
  }

  async function handleStart() {
    const auth = getFirebaseAuth();
    const user = auth?.currentUser ?? null;
    if (!user) {
      openAuthModal();
      return;
    }

    let profile = null;
    try {
      profile = await getUserProfile(user.uid);
    } catch (err) {
      console.warn("profile fetch failed", err);
    }
    const subscribed = Boolean(profile?.subscribed);

    if (book.type === "premium" && !subscribed) {
      router.push("/choose-plan");
      return;
    }

    router.push(`/player/${encodeURIComponent(String(book.id))}`);
  }

  async function handleAddToLibrary() {
    const auth = getFirebaseAuth();
    const user = auth?.currentUser ?? null;
    if (!user) {
      openAuthModal();
      return;
    }

    console.log("addToLibrary debug", {
      uid: user?.uid,
      projectId: getFirebaseApp()?.options?.projectId,
      currentUser: getFirebaseAuth()?.currentUser,
    });
    setSaving(true);
    try {
      await addBookToLibrary(user, {
        id: book.id,
        title: book.title,
        author: book.author ?? null,
        imageLink: book.imageLink ?? null,
        subTitle: book.subTitle ?? null,
      });
      window.alert("Added to My Library");
    } catch (err) {
      console.error("save failed", err);
      window.alert("Failed to add to library");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleStart}
          type="button"
          className="bg-[#032b41] hover:bg-[#15425a] rounded-sm text-[16px] text-white flex items-center justify-center w-36 h-12 gap-2"
        >
          <div className="flex">
            <svg
              aria-hidden="true"
              className="w-6 h-6"
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M928 161H699.2c-49.1 0-97.1 14.1-138.4 40.7L512 233l-48.8-31.3A255.2 255.2 0 0 0 324.8 161H96c-17.7 0-32 14.3-32 32v568c0 17.7 14.3 32 32 32h228.8c49.1 0 97.1 14.1 138.4 40.7l44.4 28.6c1.3.8 2.8 1.3 4.3 1.3s3-.4 4.3-1.3l44.4-28.6C602 807.1 650.1 793 699.2 793H928c17.7 0 32-14.3 32-32V193c0-17.7-14.3-32-32-32zM324.8 721H136V233h188.8c35.4 0 69.8 10.1 99.5 29.2l48.8 31.3 6.9 4.5v462c-47.6-25.6-100.8-39-155.2-39zm563.2 0H699.2c-54.4 0-107.6 13.4-155.2 39V298l6.9-4.5 48.8-31.3c29.7-19.1 64.1-29.2 99.5-29.2H888v488zM396.9 361H211.1c-3.9 0-7.1 3.4-7.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c.1-4.1-3.1-7.5-7-7.5zm223.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c0-4.1-3.2-7.5-7.1-7.5H627.1c-3.9 0-7.1 3.4-7.1 7.5zM396.9 501H211.1c-3.9 0-7.1 3.4-7.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c.1-4.1-3.1-7.5-7-7.5zm416 0H627.1c-3.9 0-7.1 3.4-7.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c.1-4.1-3.1-7.5-7-7.5z"></path>
            </svg>
          </div>
          Read
        </button>
        <button
          onClick={handleStart}
          type="button"
          className="bg-[#032b41] hover:bg-[#15425a] rounded-sm text-[16px] text-white flex items-center justify-center w-36 h-12 gap-2"
        >
          <div className="flex">
            <svg
              className="w-6 h-6"
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M928 161H699.2c-49.1 0-97.1 14.1-138.4 40.7L512 233l-48.8-31.3A255.2 255.2 0 0 0 324.8 161H96c-17.7 0-32 14.3-32 32v568c0 17.7 14.3 32 32 32h228.8c49.1 0 97.1 14.1 138.4 40.7l44.4 28.6c1.3.8 2.8 1.3 4.3 1.3s3-.4 4.3-1.3l44.4-28.6C602 807.1 650.1 793 699.2 793H928c17.7 0 32-14.3 32-32V193c0-17.7-14.3-32-32-32zM324.8 721H136V233h188.8c35.4 0 69.8 10.1 99.5 29.2l48.8 31.3 6.9 4.5v462c-47.6-25.6-100.8-39-155.2-39zm563.2 0H699.2c-54.4 0-107.6 13.4-155.2 39V298l6.9-4.5 48.8-31.3c29.7-19.1 64.1-29.2 99.5-29.2H888v488zM396.9 361H211.1c-3.9 0-7.1 3.4-7.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c.1-4.1-3.1-7.5-7-7.5zm223.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c0-4.1-3.2-7.5-7.1-7.5H627.1c-3.9 0-7.1 3.4-7.1 7.5zM396.9 501H211.1c-3.9 0-7.1 3.4-7.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c.1-4.1-3.1-7.5-7-7.5zm416 0H627.1c-3.9 0-7.1 3.4-7.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c.1-4.1-3.1-7.5-7-7.5z"></path>
            </svg>
          </div>
          Listen
        </button>
      </div>
      <button
        type="button"
        onClick={handleAddToLibrary}
        className="bg-gray-100 hover:bg-gray-200 rounded-sm text-[14px] text-black flex items-center justify-center w-40 h-12 gap-2 border"
      >
        {saving ? "Saving..." : "Add to My Library"}
      </button>
    </>
  );
}
