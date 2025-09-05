// components/auth/signout-button.jsx
"use client";

import { signOut } from "next-auth/react";

export default function Signout({ className }) {
  return (
    <button
      onClick={() => signOut()}
      className={className} // 👈 agora ele herda estilo de fora
    >
      Sign Out
    </button>
  );
}
