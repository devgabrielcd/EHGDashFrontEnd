'use client';
import React, { useEffect, useState } from 'react';
import { Switch, Space } from 'antd';

export default function NotificationsCard({ userId }) {
  const [notif, setNotif] = useState({ email: true, push: false });
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
        setNotif(data?.notifications || { email: true, push: false });
      } catch {
        setStatus('Erro ao carregar preferências.');
      } finally {
        alive && setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [userId, API_BASE]);

  const toggle = async (key, value) => {
    const next = { ...notif, [key]: value };
    setNotif(next);
    setSaving(true);
    setStatus('');
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/preferences/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ notifications: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setStatus(data?.detail || 'Erro ao salvar notificações.');
    } catch {
      setStatus('Erro ao salvar notificações.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ant-card ant-card-bordered">
      <div className="ant-card-head"><div className="ant-card-head-title">Notifications</div></div>
      <div className="ant-card-body">
        {loading ? 'Carregando…' : (
          <>
            <Space direction="vertical">
              <Space>
                Email <Switch checked={!!notif.email} onChange={(v)=>toggle('email', v)} disabled={saving} />
              </Space>
              <Space>
                Push <Switch checked={!!notif.push} onChange={(v)=>toggle('push', v)} disabled={saving} />
              </Space>
            </Space>
            <div style={{ marginTop: 8, minHeight: 20 }}>{status}</div>
          </>
        )}
      </div>
    </div>
  );
}
