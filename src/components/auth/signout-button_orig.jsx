'use client';
import { signOut } from 'next-auth/react';

export default function Signout({ className }) {
  const clearCookie = (name) => {
    document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=/; SameSite=Lax`;
  };

  return (
    <button
      className={className}
      onClick={async () => {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/auth/logout/`, {
            method: 'POST',
            credentials: 'include',
          });
        } catch {}
        clearCookie('dj_access'); // ← limpa o bearer persistido
        await signOut({ callbackUrl: '/' });
      }}
    >
      Logout
    </button>
  );
}
