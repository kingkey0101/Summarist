"use client";

import { usePathname } from "next/navigation";
import SideBar from "./SideBar";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  if (isHomePage) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <>
      <SideBar />
      <div className="min-h-screen">{children}</div>
    </>
  );
}
