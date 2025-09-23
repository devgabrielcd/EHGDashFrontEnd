'use client';
import React, { useEffect, useState } from 'react';
import { Switch, Space } from 'antd';

export default function IntegrationsCard({ userId }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/${userId}/integrations/`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        const json = await res.json();
        if (!alive) return;
        setData(json || {});
      } catch {
        setStatus('Erro ao carregar integrações.');
      } finally {
        alive && setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [userId, API_BASE]);

  const toggle = async (key, value) => {
    const next = { ...data, [key]: value };
    setData(next);
    setSaving(true);
    setStatus('');
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/integrations/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) setStatus(json?.detail || 'Erro ao salvar integração.');
    } catch {
      setStatus('Erro ao salvar integração.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="ant-card ant-card-bordered">
      <div className="ant-card-head"><div className="ant-card-head-title">Integrations</div></div>
      <div className="ant-card-body">Carregando…</div>
    </div>
  );

  const google = !!data.google;
  const slack = !!data.slack;

  return (
    <div className="ant-card ant-card-bordered">
      <div className="ant-card-head"><div className="ant-card-head-title">Integrations</div></div>
      <div className="ant-card-body">
        <Space direction="vertical">
          <Space>Google <Switch checked={google} onChange={(v)=>toggle('google', v)} disabled={saving} /></Space>
          <Space>Slack <Switch checked={slack} onChange={(v)=>toggle('slack', v)} disabled={saving} /></Space>
        </Space>
        <div style={{ marginTop: 8, minHeight: 20 }}>{status}</div>
      </div>
    </div>
  );
}
