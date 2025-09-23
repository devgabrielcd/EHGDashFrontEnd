'use client';
import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';

export default function SecurityCard() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');

  const onFinish = async (v) => {
    if (v.new_password !== v.confirm_password) {
      setStatus('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch(`${API_BASE}/api/users/change-password/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ current_password: v.current_password, new_password: v.new_password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setStatus('Senha alterada!');
      else setStatus(data?.detail || 'Erro ao alterar a senha.');
    } catch {
      setStatus('Erro ao alterar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ant-card ant-card-bordered">
      <div className="ant-card-head"><div className="ant-card-head-title">Security</div></div>
      <div className="ant-card-body">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Senha atual" name="current_password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item label="Nova senha" name="new_password" rules={[{ required: true, min: 8 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item label="Confirmar senha" name="confirm_password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>Atualizar senha</Button>
          <div style={{ marginTop: 8, minHeight: 20 }}>{status}</div>
        </Form>
      </div>
    </div>
  );
}
