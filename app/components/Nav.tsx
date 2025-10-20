"use effect";

import Image from "next/image";
import Link from "next/link";
import LoginButton from "./LoginButton";

export default function Nav() {
  return (
    <nav className="nav h-20">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6">
        <figure className="nav__img--mask relative w-28 h-8 md:w-72 md:h-12">
          <Image
            className="nav__img"
            src={"/assets/logo.png"}
            alt="summarist logo"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </figure>
        <ul className="nav__list--wrapper">
          <li className="nav__list nav__list--login">
            <Link href={"/"} className="home__cta--btn">
              <LoginButton />
            </Link>
          </li>
          <li className="nav__list nav__list--mobile">About</li>
          <li className="nav__list nav__list--mobile">Contact</li>
          <li className="nav__list nav__list--mobile">Help</li>
        </ul>
      </div>
    </nav>
  );
}
