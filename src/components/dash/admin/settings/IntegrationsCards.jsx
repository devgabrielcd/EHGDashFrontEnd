'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Switch, Space, Card } from 'antd';
import { apiBase, authHeaders } from '@/lib/apiHeaders';

export default function IntegrationsCard({ userId }) {
  const API_BASE = apiBase();
  const [resolvedId, setResolvedId] = useState(
    Number.isFinite(Number(userId)) && Number(userId) > 0 ? Number(userId) : null
  );
  const [loading, setLoading] = useState(true);
  const [google, setGoogle] = useState(false);
  const [slack, setSlack] = useState(false);
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
        const res = await fetch(`${API_BASE}/api/users/${effectiveUserId}/integrations/`, {
          credentials: 'include',
          headers: authHeaders(),
        });
        const data = await res.json();
        if (!alive) return;
        setGoogle(!!data?.google);
        setSlack(!!data?.slack);
      } catch {
        setStatus('Failed to load integrations.');
      } finally {
        alive && setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [effectiveUserId, API_BASE]);

  const update = async (next) => {
    setStatus('');
    try {
      const res = await fetch(`${API_BASE}/api/users/${effectiveUserId}/integrations/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setStatus(d?.detail || 'Failed to update integrations.');
      }
    } catch {
      setStatus('Error while updating integrations.');
    }
  };

  return (
    <Card title="Integrations" variant="outlined" className="ant-card" loading={loading}>       <Space size="large" direction="vertical">
        <div>
          <span style={{ marginRight: 12 }}>Google</span>
          <Switch checked={google} onChange={(v) => { setGoogle(v); update({ google: v, slack }); }} />
        </div>
        <div>
          <span style={{ marginRight: 12 }}>Slack</span>
          <Switch checked={slack} onChange={(v) => { setSlack(v); update({ google, slack: v }); }} />
        </div>
      </Space>
      <div style={{ marginTop: 8, minHeight: 20 }}>{status}</div>
    </Card>
  );
}
