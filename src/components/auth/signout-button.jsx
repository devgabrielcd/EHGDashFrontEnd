// src/components/auth/signout-button.jsx
'use client';

import { signOut } from 'next-auth/react';

function clearCookie(name) {
  try {
    document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=/; SameSite=Lax`;
  } catch {}
}

export default function Signout({ className }) {
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');

  const handleLogout = async () => {
    try {
      // 1) avisa o backend para invalidar a sessão (sessionid)
      await fetch(`${API_BASE}/api/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignora falha no request
    }

    // 2) limpa o Bearer que usamos no front
    clearCookie('dj_access');     // JWT salvo no front
    clearCookie('dj_refresh');    // se você vier a utilizar
    // (cookies do domínio 8000 como 'sessionid' não podem ser deletados daqui;
    // o flush do backend já invalida)

    // 3) sai do NextAuth e redireciona
    await signOut({ callbackUrl: '/' });
  };

  return (
    <button className={className} onClick={handleLogout}>
      Logout
    </button>
  );
}
