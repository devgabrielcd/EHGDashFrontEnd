'use client';
import React, { useState } from 'react';
import { Form, Input, Button, Space } from 'antd';
import { apiBase, authHeaders } from '@/lib/apiHeaders';

export default function SecurityCard() {
  const [form] = Form.useForm();
  const API_BASE = apiBase();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const onFinish = async (values) => {
    setSaving(true);
    setStatus('');
    try {
      const res = await fetch(`${API_BASE}/api/users/change-password/`, {
        method: 'POST',
        credentials: 'include',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: values.current_password,
          new_password: values.new_password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus('Password changed successfully.');
        form.resetFields();
      } else {
        setStatus(data?.detail || 'Failed to change the password.');
      }
    } catch {
      setStatus('Error while changing the password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ant-card ant-card-bordered">
      <div className="ant-card-head"><div className="ant-card-head-title">Security</div></div>
      <div className="ant-card-body">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item label="Current password" name="current_password" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item label="New password" name="new_password" rules={[{ required: true, min: 6 }]}>
              <Input.Password />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={saving}>
              Update password
            </Button>
          </Form>
          <div style={{ minHeight: 20 }}>{status}</div>
        </Space>
      </div>
    </div>
  );
}
