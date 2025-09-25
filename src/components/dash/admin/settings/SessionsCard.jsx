'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { List, Button, Card, Empty } from 'antd';
import { apiBase, authHeaders } from '@/lib/apiHeaders';

export default function SessionsCard({ userId }) {
  const API_BASE = apiBase();
  const [resolvedId, setResolvedId] = useState(
    Number.isFinite(Number(userId)) && Number(userId) > 0 ? Number(userId) : null
  );
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
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

  const load = async () => {
    if (!effectiveUserId) return;
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch(`${API_BASE}/api/users/${effectiveUserId}/sessions/`, {
        credentials: 'include',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (Array.isArray(data)) setSessions(data); else setSessions([]);
    } catch {
      setStatus('Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [effectiveUserId]);

  const revoke = async (key) => {
    setStatus('');
    try {
      const res = await fetch(`${API_BASE}/api/users/${effectiveUserId}/sessions/${key}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: authHeaders(),
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== key));
      } else {
        const d = await res.json().catch(() => ({}));
        setStatus(d?.detail || 'Failed to revoke session.');
      }
    } catch {
      setStatus('Error while revoking session.');
    }
  };

  return (
    <Card title="Sessions" variant="outlined" className="ant-card" loading={loading}>
      {sessions.length === 0 ? (
        <Empty description="No active sessions." />
      ) : (
        <List
          dataSource={sessions}
          renderItem={(s) => (
            <List.Item
              actions={[
                <Button danger size="small" key="revoke" onClick={() => revoke(s.id)}>
                  Revoke
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={s.device || 'Unknown device'}
                description={`${s.ip || 'Unknown IP'} • Last active: ${s.last_active_at || '—'}`}
              />
              {s.current ? <span style={{ fontSize: 12, opacity: 0.7 }}>current</span> : null}
            </List.Item>
          )}
        />
      )}
      <div style={{ marginTop: 8, minHeight: 20 }}>{status}</div>
    </Card>
  );
}
