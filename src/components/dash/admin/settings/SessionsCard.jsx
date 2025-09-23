//'use client';
import React, { useEffect, useState } from 'react';
import { List, Button, Tag } from 'antd';

export default function SessionsCard({ userId }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(null);
  const [status, setStatus] = useState('');
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');

  const load = async () => {
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/sessions/`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      if (res.ok) setSessions(data || []);
      else setStatus(data?.detail || 'Erro ao carregar sessões.');
    } catch {
      setStatus('Erro ao carregar sessões.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [userId]);

  const revoke = async (key) => {
    setRevoking(key);
    setStatus('');
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/sessions/${key}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        await load();
      } else {
        setStatus(data?.detail || 'Não foi possível revogar.');
      }
    } catch {
      setStatus('Não foi possível revogar.');
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div className="ant-card ant-card-bordered">
      <div className="ant-card-head"><div className="ant-card-head-title">Sessions</div></div>
      <div className="ant-card-body">
        <List
          loading={loading}
          dataSource={sessions}
          locale={{ emptyText: 'Sem sessões.' }}
          renderItem={(s) => (
            <List.Item
              actions={[
                <Button
                  danger
                  onClick={() => revoke(s.id)}
                  loading={revoking === s.id}
                  disabled={s.current && sessions.length === 1}
                  key="revoke"
                >
                  Revogar
                </Button>
              ]}
            >
              <List.Item.Meta
                title={<>{s.device} {s.current && <Tag color="green">Atual</Tag>}</>}
                description={s.last_active_at ? `Último acesso: ${new Date(s.last_active_at).toLocaleString()}` : null}
              />
            </List.Item>
          )}
        />
        <div style={{ marginTop: 8, minHeight: 20 }}>{status}</div>
      </div>
    </div>
  );
}
