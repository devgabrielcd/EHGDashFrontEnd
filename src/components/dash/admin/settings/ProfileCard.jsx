'use client';
import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Avatar, Space, Skeleton } from 'antd';
import { apiBase, authHeaders } from '@/lib/apiHeaders';

export default function ProfileCard({ userId }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [me, setMe] = useState(null);
  const API_BASE = apiBase();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/${userId}/`, {
          credentials: 'include',
          headers: authHeaders(),
        });
        const data = await res.json();
        if (!alive) return;
        setMe(data);
        form.setFieldsValue({
          first_name: data?.user?.first_name,
          last_name: data?.user?.last_name,
          email: data?.user?.email,
          phone_number: data?.profile?.phone_number,
        });
      } catch {
        setStatus('Erro ao carregar perfil.');
      } finally {
        alive && setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [userId, form, API_BASE]);

  const onFinish = async (values) => {
    setSaving(true);
    setStatus('');
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone_number: values.phone_number,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMe(data);
        setStatus('Perfil atualizado!');
      } else {
        setStatus(data?.detail || 'Falha ao salvar.');
      }
    } catch {
      setStatus('Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const disabled = loading || saving;

  return (
    <div className="ant-card ant-card-bordered">
      <div className="ant-card-head"><div className="ant-card-head-title">Profile</div></div>
      <div className="ant-card-body">
        <Space align="start" size="large">
          <Avatar size={64}>
            {(me?.user?.first_name || me?.user?.username || '?')?.[0]?.toUpperCase()}
          </Avatar>
          <div style={{ minWidth: 320 }}>
            {loading && <Skeleton active paragraph={{ rows: 3 }} />}
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item label="First name" name="first_name" rules={[{ required: true }]}>
                <Input disabled={disabled} />
              </Form.Item>
              <Form.Item label="Last name" name="last_name" rules={[{ required: true }]}>
                <Input disabled={disabled} />
              </Form.Item>
              <Form.Item label="Email" name="email" rules={[{ type: 'email' }]}>
                <Input disabled={disabled} />
              </Form.Item>
              <Form.Item label="Phone" name="phone_number">
                <Input disabled={disabled} />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={saving} disabled={loading}>
                Salvar
              </Button>
            </Form>
            <div style={{ marginTop: 8, minHeight: 20 }}>{status}</div>
          </div>
        </Space>
      </div>
    </div>
  );
}
