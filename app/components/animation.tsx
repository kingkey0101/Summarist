"use client";

import { useEffect } from "react";

export default function Stats() {
  useEffect(() => {
    const wrappers = Array.from(
      document.querySelectorAll(".statistics__wrapper")
    );
    if (!wrappers.length) return;

    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            wrappers.forEach((w) => w.classList.add("animate"));
            observer.disconnect();
          }
        });
      },
      { threshold: 0.18 }
    );

    wrappers.forEach((w) => obs.observe(w));
    return () => obs.disconnect();
  }, []);

  return null;
}
