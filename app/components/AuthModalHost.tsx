"use client";

import { useEffect, useState } from "react";
import AuthModal from "./AuthModal";

export default function AuthModalHost() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
    }
    function handleClose() {
      setOpen(false);
    }

    window.addEventListener("open-auth-modal", handleOpen);
    window.addEventListener("close-auth-modal", handleClose);
    return () => {
      window.removeEventListener("open-auth-modal", handleOpen);
      window.removeEventListener("close-auth-modal", handleClose);
    };
  }, []);
  return <AuthModal isOpen={open} onClose={() => setOpen(false)} />;
}
