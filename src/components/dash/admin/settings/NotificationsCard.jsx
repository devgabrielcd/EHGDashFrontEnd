'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Switch, Space, Card } from 'antd';
import { apiBase, authHeaders } from '@/lib/apiHeaders';

export default function NotificationsCard({ userId }) {
  const API_BASE = apiBase();
  const [resolvedId, setResolvedId] = useState(
    Number.isFinite(Number(userId)) && Number(userId) > 0 ? Number(userId) : null
  );
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(false);
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

  // load
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
        setEmail(!!data?.notifications?.email);
        setPush(!!data?.notifications?.push);
      } catch {
        setStatus('Failed to load notification settings.');
      } finally {
        alive && setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [effectiveUserId, API_BASE]);

  const update = async (next) => {
    setStatus('');
    try {
      const res = await fetch(`${API_BASE}/api/users/${effectiveUserId}/preferences/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications: next }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setStatus(d?.detail || 'Failed to update notifications.');
      }
    } catch {
      setStatus('Error while updating notifications.');
    }
  };

  return (
    <Card title="Notifications" variant="outlined" className="ant-card" loading={loading}>
      <Space size="large" direction="vertical">
        <div>
          <span style={{ marginRight: 12 }}>Email</span>
          <Switch
            checked={email}
            onChange={(v) => { setEmail(v); update({ email: v, push }); }}
          />
        </div>
        <div>
          <span style={{ marginRight: 12 }}>Push</span>
          <Switch
            checked={push}
            onChange={(v) => { setPush(v); update({ email, push: v }); }}
          />
        </div>
      </Space>
      <div style={{ marginTop: 8, minHeight: 20 }}>{status}</div>
    </Card>
  );
}
