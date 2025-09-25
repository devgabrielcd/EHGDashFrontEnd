'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { apiBase } from '@/lib/apiHeaders';
import styles from './sign-in.module.css';

export default function SignInClient() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const setCookie = (name, value, days = 1) => {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `; Expires=${d.toUTCString()}`;
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; SameSite=Lax${secure}${expires}`;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const username = form.get('username');
      const password = form.get('password');

      // 1) pega JWT do Django
      const r = await fetch(`${apiBase()}/auth/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = await r.json();
      if (!r.ok || !data?.access) {
        throw new Error(data?.detail || 'Falha ao obter token do Django');
      }

      // 2) salva token em cookie (persistente após redirect)
      setCookie('dj_access', data.access, 1);          // ← este é o ponto chave
      window.__ACCESS_TOKEN__ = data.access;           // opcional, ajuda nas mesmas page-loads

      // 3) cria sessão do NextAuth
      const result = await signIn('credentials', {
        redirect: true,
        username,
        password,
        callbackUrl: '/dashboard',
      });
      if (result?.error) throw new Error(result.error);
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Erro no login');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <label className={styles.label}>
        Username
        <input name="username" type="text" className={styles.input} />
      </label>
      <label className={styles.label}>
        Password
        <input name="password" type="password" className={styles.input} />
      </label>
      <button type="submit" className={styles.button} disabled={loading}>
        {loading ? 'Entrando…' : 'Sign In'}
      </button>
      {err && <div style={{ color: '#b71c1c', marginTop: 8 }}>{err}</div>}
    </form>
  );
}
