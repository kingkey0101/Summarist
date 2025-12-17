"use client";

import type React from "react";

type Props = {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  children?: React.ReactNode;
};

export default function Skeleton({
  className = "",
  width,
  height,
  rounded = true,
}: Props) {
  const style: React.CSSProperties = {};
  if (width !== undefined)
    style.width = typeof width === "number" ? `${width}px` : width;
  if (height !== undefined)
    style.height = typeof height === "number" ? `${height}px` : height;
  return (
    <div
      aria-hidden
      className={`animate-pulse bg-gray-200 dark:bg-slate-700 ${
        rounded ? "rounded-md" : ""
      } ${className}`}
      style={style}
    />
  );
}
