"use client";

import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebaseClient";

type Props = {
  src: string;
  title?: string;
  author?: string | null;
  imageSrc?: string | null;
  bookId?: string | null;
  bookInfo?: Record<string, unknown> | null;
};

function formatTime(s: number) {
  if (!Number.isFinite(s) || s <= 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${sec}`;
}

export default function AudioPlayer({
  src,
  title,
  author,
  imageSrc,
  bookId = null,
  bookInfo = null,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onTime = () => setCurrent(a.currentTime);
    const onLoaded = () => setDuration(a.duration || 0);
    const onEnd = async () => {
      setPlaying(false);
      if (bookId) {
        try {
          const auth = getFirebaseAuth();
          const user = auth?.currentUser ?? null;
          const db = getFirebaseDb();
          if (user && db) {
            const p = doc(db, "users", user.uid, "finished", String(bookId));
            await setDoc(p, {
              finishedAt: serverTimestamp(),
              ...(bookInfo ?? {}),
            });
          }
        } catch (err) {
          console.warn("markFinished failed", err);
        }
      }
    };

    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("ended", onEnd);
    };
  }, [bookId, bookInfo]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
  }, [volume]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.play().catch(() => setPlaying(false));
    else a.pause();
  }, [playing]);

  function togglePlay() {
    setPlaying((p) => !p);
  }

  function seekTo(v: number) {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = v;
    setCurrent(v);
  }

  function skip(seconds: number) {
    const a = audioRef.current;
    if (!a) return;
    seekTo(Math.max(0, Math.min(duration || 0, a.currentTime + seconds)));
  }

  const progressPercent = duration
    ? Math.min(100, Math.max(0, (current / duration) * 100))
    : 0;

  return (
    <div className="w-full bg-white border rounded-lg p-4 shadow-sm">
      <audio ref={audioRef} src={src} preload="metadata">
        <track kind="captions" srcLang="en" label="English" default />
      </audio>
      <div className="flex items-center gap-4">
        <div className="shrink-0 w-20 h-20 rounded overflow-hidden bg-gray-100">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={title ?? "cover"}
              width={80}
              height={80}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate">{title}</div>
              <div className="text-xs text-gray-500 truncate">{author}</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => skip(-15)}
                className="px-2 py-1 text-sm rounded-md bg-gray-50 hover:bg-gray-100"
                aria-label="Skip back 15s"
              >
                -15s
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? "❚❚" : "▶︎"}
              </button>

              <button
                type="button"
                onClick={() => skip(15)}
                className="px-2 py-1 text-sm rounded-md bg-gray-50 hover:bg-gray-100"
                aria-label="Skip forward 15s"
              >
                +15s
              </button>
            </div>
          </div>

          <div className="mt-3">
            <div
              className="h-2 bg-gray-200 rounded overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progressPercent)}
              onClick={(e) => {
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                const px = (e.nativeEvent as MouseEvent).clientX - rect.left;
                const pct = px / rect.width;
                seekTo((pct || 0) * (duration || 0));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  const pct = 0.5;
                  seekTo(pct * (duration || 0));
                }
              }}
            >
              <div
                className="h-2 bg-blue-600"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatTime(current)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        <div className="w-36 flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-500"
              viewBox="0 0 24 24"
              fill="currentColor"
              role="img"
              aria-label="Volume"
            >
              <path d="M3 10v4h4l5 5V5L7 10H3z" />
            </svg>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20"
              aria-label="Volume"
            />
          </div>

          <div className="text-xs text-gray-500">Audio</div>
        </div>
      </div>
    </div>
  );
}
