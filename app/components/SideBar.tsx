"use client";

import { signOut } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/lib/firebaseClient";

const menuItems = [
  { name: "For you", href: "/for-you" },
  { name: "My Library", href: "/my-library" },
  { name: "Highlights", href: "/highlights" },
  { name: "Search", href: "/search" },
  { name: "Settings", href: "/settings" },
  { name: "Help & Support", href: "/help" },
  { name: "Logout", href: "/Login" },
];

function Icon({ name }: { name: string }) {
  switch (name) {
    case "For you":
      return (
        <svg
          role="img"
          aria-label="For you"
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 1024 1024"
          height="24px"
          width="24px"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M946.5 505L560.1 118.8l-25.9-25.9a31.5 31.5 0 0 0-44.4 0L77.5 505a63.9 63.9 0 0 0-18.8 46c.4 35.2 29.7 63.3 64.9 63.3h42.5V940h691.8V614.3h43.4c17.1 0 33.2-6.7 45.3-18.8a63.6 63.6 0 0 0 18.7-45.3c0-17-6.7-33.1-18.8-45.2zM568 868H456V664h112v204zm217.9-325.7V868H632V640c0-22.1-17.9-40-40-40H432c-22.1 0-40 17.9-40 40v228H238.1V542.3h-96l370-369.7 23.1 23.1L882 542.3h-96.1z"></path>
        </svg>
      );
    case "My Library":
      return (
        <svg
          role="img"
          aria-label="My Library"
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 16 16"
          height="24px"
          width="24px"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"></path>
        </svg>
      );
    case "Highlights":
      return (
        <svg
          role="img"
          aria-label="Highlights"
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 24 24"
          height="24px"
          width="24px"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            <path fill="none" d="M0 0h24v24H0z"></path>
            <path d="M17.849 11.808l-.707-.707-9.9 9.9H3v-4.243L14.313 5.444l5.657 5.657a1 1 0 0 1 0 1.414l-7.07 7.071-1.415-1.414 6.364-6.364zm-2.121-2.121l-1.415-1.414L5 17.586v1.415h1.414l9.314-9.314zm2.828-7.071l2.829 2.828a1 1 0 0 1 0 1.414L19.97 8.273 15.728 4.03l1.414-1.414a1 1 0 0 1 1.414 0z"></path>
          </g>
        </svg>
      );
    case "Search":
      return (
        <svg
          role="img"
          aria-label="Search"
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 1024 1024"
          height="24px"
          width="24px"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0 0 11.6 0l43.6-43.5a8.2 8.2 0 0 0 0-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"></path>
        </svg>
      );
    case "Settings":
      return (
        <svg
          stroke="currentColor"
          role="img"
          aria-label="settings"
          fill="none"
          strokeWidth="0"
          viewBox="0 0 15 15"
          height="24px"
          width="24px"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.07095 0.650238C6.67391 0.650238 6.32977 0.925096 6.24198 1.31231L6.0039 2.36247C5.6249 2.47269 5.26335 2.62363 4.92436 2.81013L4.01335 2.23585C3.67748 2.02413 3.23978 2.07312 2.95903 2.35386L2.35294 2.95996C2.0722 3.2407 2.0232 3.6784 2.23493 4.01427L2.80942 4.92561C2.62307 5.2645 2.47227 5.62594 2.36216 6.00481L1.31209 6.24287C0.924883 6.33065 0.650024 6.6748 0.650024 7.07183V7.92897C0.650024 8.32601 0.924883 8.67015 1.31209 8.75794L2.36228 8.99603C2.47246 9.375 2.62335 9.73652 2.80979 10.0755L2.2354 10.9867C2.02367 11.3225 2.07267 11.7602 2.35341 12.041L2.95951 12.6471C3.24025 12.9278 3.67795 12.9768 4.01382 12.7651L4.92506 12.1907C5.26384 12.377 5.62516 12.5278 6.0039 12.6379L6.24198 13.6881C6.32977 14.0753 6.67391 14.3502 7.07095 14.3502H7.92809C8.32512 14.3502 8.66927 14.0753 8.75705 13.6881L8.99505 12.6383C9.37411 12.5282 9.73573 12.3773 10.0748 12.1909L10.986 12.7653C11.3218 12.977 11.7595 12.928 12.0403 12.6473L12.6464 12.0412C12.9271 11.7604 12.9761 11.3227 12.7644 10.9869L12.1902 10.076C12.3768 9.73688 12.5278 9.37515 12.638 8.99596L13.6879 8.75794C14.0751 8.67015 14.35 8.32601 14.35 7.92897V7.07183C14.35 6.6748 14.0751 6.33065 13.6879 6.24287L12.6381 6.00488C12.528 5.62578 12.3771 5.26414 12.1906 4.92507L12.7648 4.01407C12.9766 3.6782 12.9276 3.2405 12.6468 2.95975L12.0407 2.35366C11.76 2.07292 11.3223 2.02392 10.9864 2.23565L10.0755 2.80989C9.73622 2.62328 9.37437 2.47229 8.99505 2.36209L8.75705 1.31231C8.66927 0.925096 8.32512 0.650238 7.92809 0.650238H7.07095ZM4.92053 3.81251C5.44724 3.44339 6.05665 3.18424 6.71543 3.06839L7.07095 1.50024H7.92809L8.28355 3.06816C8.94267 3.18387 9.5524 3.44302 10.0794 3.81224L11.4397 2.9547L12.0458 3.56079L11.1882 4.92117C11.5573 5.44798 11.8164 6.0575 11.9321 6.71638L13.5 7.07183V7.92897L11.932 8.28444C11.8162 8.94342 11.557 9.55301 11.1878 10.0798L12.0453 11.4402L11.4392 12.0462L10.0787 11.1886C9.55192 11.5576 8.94241 11.8166 8.28355 11.9323L7.92809 13.5002H7.07095L6.71543 11.932C6.0569 11.8162 5.44772 11.5572 4.92116 11.1883L3.56055 12.046L2.95445 11.4399L3.81213 10.0794C3.4431 9.55266 3.18403 8.94326 3.06825 8.2845L1.50002 7.92897V7.07183L3.06818 6.71632C3.18388 6.05765 3.44283 5.44833 3.81171 4.92165L2.95398 3.561L3.56008 2.95491L4.92053 3.81251ZM9.02496 7.50008C9.02496 8.34226 8.34223 9.02499 7.50005 9.02499C6.65786 9.02499 5.97513 8.34226 5.97513 7.50008C5.97513 6.65789 6.65786 5.97516 7.50005 5.97516C8.34223 5.97516 9.02496 6.65789 9.02496 7.50008ZM9.92496 7.50008C9.92496 8.83932 8.83929 9.92499 7.50005 9.92499C6.1608 9.92499 5.07513 8.83932 5.07513 7.50008C5.07513 6.16084 6.1608 5.07516 7.50005 5.07516C8.83929 5.07516 9.92496 6.16084 9.92496 7.50008Z"
            fill="currentColor"
          ></path>
        </svg>
      );
    case "Help & Support":
      return (
        <svg
          stroke="currentColor"
          fill="none"
          role="img"
          aria-label="help"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          height="24px"
          width="24px"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      );
    case "Logout":
      return (
        <svg
          stroke="currentColor"
          fill="none"
          role="img"
          aria-label="Logout"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          height="24px"
          width="24px"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      );
  }
}

export default function SideBar() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  async function handleLogout() {
    const auth = getFirebaseAuth();
    if (!auth) {
      console.warn("Auth not available");
      router.push("/");
      return;
    }
    try {
      await signOut(auth);
    } catch (err) {
      console.error("signOut failed", err);
    } finally {
      router.push("/");
    }
  }

  return (
    <aside className="md:fixed md:left-0 md:top-0 md:h-screen md:w-52 w-full bg-[#f7faf9] text-black flex flex-col items-start z-20">
      <div className="flex justify-start items-start pb-10 pt-6 ml-4">
        <Image
          className="for-you-logo"
          src={"/assets/logo.png"}
          alt="summarist logo"
          width={160}
          height={114}
          style={{ objectFit: "scale-down" }}
          sizes="(max-width: 768px) 240px, 495px"
          priority
        />
      </div>
      <nav className="flex flex-col w-full flex-1 pb-10">
        {(() => {
          const splitAt = Math.max(0, menuItems.length - 3);
          const topItems = menuItems.slice(0, splitAt);
          const bottomItems = menuItems.slice(splitAt);

          const renderItem = (item: { name: string; href: string }) => {
            const isActive = pathname?.startsWith(item.href) ?? false;
            if (item.name === "Logout") {
              return (
                <div
                  key={item.name}
                  className="flex items-center w-full text-[#032b41]"
                >
                  <div
                    aria-hidden="true"
                    className={`w-1 rounded-r transition-colors duration-150 self-stretch ${
                      isActive ? "bg-green-500" : "bg-transparent"
                    }`}
                  ></div>
                  <button
                    className="flex items-center gap-3 px-4 py-2 w-full text-black hover:bg-gray-200 text-left"
                    type="button"
                    onClick={handleLogout}
                  >
                    <span className="text-[#032b41]">
                      <Icon name={item.name} />
                    </span>
                    <span>{item.name}</span>
                  </button>
                </div>
              );
            }
            return (
              <div key={item.href} className="flex items-center w-full">
                <div
                  aria-hidden
                  className={`w-1 rounded-r transition-colors duration-150 self-stretch ${
                    isActive ? "bg-green-500" : "bg-transparent"
                  }`}
                ></div>

                <Link
                  href={item.href}
                  key={item.name}
                  className={`flex items-center gap-3 px-4 py-2 w-full text-black hover:bg-gray-200 ${
                    isActive ? "bg-gray-100" : ""
                  }`}
                >
                  <span className="text-black">
                    <Icon name={item.name} />
                  </span>
                  <span className="text-[#032b41]">{item.name}</span>
                </Link>
              </div>
            );
          };
          return (
            <>
              <div className="flex flex-col gap-5">
                {topItems.map(renderItem)}
              </div>
              <div className="mt-auto flex flex-col gap-5">
                {bottomItems.map(renderItem)}
              </div>
            </>
          );
        })()}
      </nav>
    </aside>
  );
}
