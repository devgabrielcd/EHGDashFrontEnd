'use client';
import React, { useState } from 'react';
import { Button, Popconfirm } from 'antd';
import { useRouter } from 'next/navigation';

export default function DangerZoneCard({ userId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');

  const handleDelete = async () => {
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (res.status === 204) {
        router.push('/logout'); // ou '/', conforme seu fluxo
        return;
      }
      const data = await res.json().catch(() => ({}));
      setStatus(data?.detail || 'Falha ao excluir a conta.');
    } catch {
      setStatus('Erro ao excluir a conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ant-card ant-card-bordered">
      <div className="ant-card-head"><div className="ant-card-head-title">Danger Zone</div></div>
      <div className="ant-card-body">
        <Popconfirm
          title="Excluir conta?"
          description="Essa ação é irreversível e removerá seus dados."
          okText="Sim, excluir"
          cancelText="Cancelar"
          okButtonProps={{ danger: true, loading }}
          onConfirm={handleDelete}
        >
          <Button danger loading={loading}>Excluir conta</Button>
        </Popconfirm>
        <div style={{ marginTop: 8, minHeight: 20 }}>{status}</div>
      </div>
    </div>
  );
}
