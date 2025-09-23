'use client';
import React, { useEffect, useState } from 'react';
import { Radio } from 'antd';

export default function AppearanceCard({ userId }) {
  const [theme, setTheme] = useState('system');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/${userId}/preferences/`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        const data = await res.json();
        if (!alive) return;
        setTheme(data?.theme || 'system');
      } catch {
        setStatus('Erro ao carregar preferências.');
      } finally {
        alive && setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [userId, API_BASE]);

  const onChange = async (e) => {
    const value = e.target.value;
    setTheme(value);
    setSaving(true);
    setStatus('');
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/preferences/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ theme: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setStatus(data?.detail || 'Erro ao salvar tema.');
    } catch {
      setStatus('Erro ao salvar tema.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ant-card ant-card-bordered">
      <div className="ant-card-head"><div className="ant-card-head-title">Appearance</div></div>
      <div className="ant-card-body">
        {loading ? 'Carregando…' : (
          <>
            <Radio.Group onChange={onChange} value={theme} disabled={saving}>
              <Radio.Button value="light">Light</Radio.Button>
              <Radio.Button value="dark">Dark</Radio.Button>
              <Radio.Button value="system">System</Radio.Button>
            </Radio.Group>
            <div style={{ marginTop: 8, minHeight: 20 }}>{status}</div>
          </>
        )}
      </div>
    </div>
  );
}
