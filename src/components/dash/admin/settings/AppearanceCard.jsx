'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Radio, Card } from 'antd';
import { apiBase, authHeaders } from '@/lib/apiHeaders';

export default function AppearanceCard({ userId }) {
  const API_BASE = apiBase();
  const [resolvedId, setResolvedId] = useState(
    Number.isFinite(Number(userId)) && Number(userId) > 0 ? Number(userId) : null
  );
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('system');
  const [status, setStatus] = useState('');

  // resolve userId
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (resolvedId) return;
        const r = await fetch(`${API_BASE}/api/auth/session/`, {
          credentials: 'include',
          headers: authHeaders(),
        });
        const d = await r.json();
        if (!alive) return;
        const id = Number(d?.user?.id);
        if (id) setResolvedId(id); else setStatus('Unable to identify the user.');
      } catch {
        alive && setStatus('Unable to identify the user.');
      }
    })();
    return () => { alive = false; };
  }, [API_BASE, resolvedId]);

  const effectiveUserId = useMemo(() => {
    const pid = Number(userId);
    if (Number.isFinite(pid) && pid > 0) return pid;
    return resolvedId;
  }, [userId, resolvedId]);

  // load current prefs
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!effectiveUserId) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/users/${effectiveUserId}/preferences/`, {
          credentials: 'include',
          headers: authHeaders(),
        });
        const data = await res.json();
        if (!alive) return;
        setTheme(data?.theme || 'system');
      } catch {
        setStatus('Failed to load preferences.');
      } finally {
        alive && setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [effectiveUserId, API_BASE]);

  const changeTheme = async (val) => {
    setTheme(val);
    setStatus('');
    try {
      const res = await fetch(`${API_BASE}/api/users/${effectiveUserId}/preferences/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: val }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setStatus(d?.detail || 'Failed to update theme.');
      }
    } catch {
      setStatus('Error while updating theme.');
    }
  };

  return (
    <Card title="Appearance" variant="outlined" className="ant-card" loading={loading}>
      <Radio.Group
        onChange={(e) => changeTheme(e.target.value)}
        value={theme}
        optionType="button"
        buttonStyle="solid"
      >
        <Radio.Button value="light">Light</Radio.Button>
        <Radio.Button value="dark">Dark</Radio.Button>
        <Radio.Button value="system">System</Radio.Button>
      </Radio.Group>
      <div style={{ marginTop: 8, minHeight: 20 }}>{status}</div>
    </Card>
  );
}
