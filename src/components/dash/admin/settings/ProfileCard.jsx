'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Form, Input, Button, Avatar, Space, Skeleton } from 'antd';
import { apiBase, authHeaders } from '@/lib/apiHeaders';

export default function ProfileCard({ userId }) {
  const [form] = Form.useForm();
  const API_BASE = apiBase();
  const [resolvedId, setResolvedId] = useState(
    Number.isFinite(Number(userId)) && Number(userId) > 0 ? Number(userId) : null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [me, setMe] = useState(null);

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

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!effectiveUserId) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/users/${effectiveUserId}/`, {
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
        setStatus('Failed to load profile.');
      } finally {
        alive && setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [effectiveUserId, API_BASE, form]);

  const onFinish = async (values) => {
    if (!effectiveUserId) return;
    setSaving(true);
    setStatus('');
    try {
      const res = await fetch(`${API_BASE}/api/users/${effectiveUserId}/`, {
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
        setStatus('Profile updated!');
      } else {
        setStatus(data?.detail || 'Failed to save.');
      }
    } catch {
      setStatus('Error while saving.');
    } finally {
      setSaving(false);
    }
  };

  const disabled = loading || saving;
  const initial = (me?.user?.first_name || me?.user?.username || '?')?.[0]?.toUpperCase();

  return (
    <div className="ant-card ant-card-bordered">
      <div className="ant-card-head"><div className="ant-card-head-title">Profile</div></div>
      <div className="ant-card-body">
        <Space align="start" size="large">
          <Avatar size={64}>{initial}</Avatar>
          <div style={{ minWidth: 320 }}>
            {loading && <Skeleton active paragraph={{ rows: 3 }} />}
            {/* Mantém o Form montado para conectar o `form` */}
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              style={{ display: loading ? 'none' : 'block' }}
            >
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
                Save
              </Button>
            </Form>
            <div style={{ marginTop: 8, minHeight: 20 }}>{status}</div>
          </div>
        </Space>
      </div>
    </div>
  );
}
