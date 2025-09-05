"use client";

import React, { useMemo, useState } from "react";
import { Card, Form, Input, Space, Button, Alert, message } from "antd";
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import SectionTitle from "./SectionTitle";
import { callAPI } from "./api";

export default function SecurityCard() {
  const [loading, setLoading] = useState(false);

  const cardStyle = useMemo(
    () => ({ background: "var(--bg-panel)", borderColor: "var(--border-strong)" }),
    []
  );

  const onChangePassword = async (values) => {
    if (values.new_password !== values.confirm_new_password) {
      message.error("New password and confirmation do not match.");
      return;
    }
    try {
      setLoading(true);
      await callAPI("/auth/password/change/", values);
      message.success("Password changed successfully!");
    } catch {
      message.error("Could not change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={<SectionTitle icon={<LockOutlined />}>Security</SectionTitle>} style={cardStyle}>
      <Alert
        type="info"
        message="Tip"
        description="Use a strong password and enable 2FA when available."
        showIcon
        style={{ marginBottom: 12 }}
      />
      <Form layout="vertical" onFinish={onChangePassword}>
        <Form.Item label="Current password" name="current_password" rules={[{ required: true }]}>
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Current password"
            iconRender={(v) => (v ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        <Form.Item label="New password" name="new_password" rules={[{ required: true, min: 6 }]}>
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="New password"
            iconRender={(v) => (v ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        <Form.Item
          label="Confirm new password"
          name="confirm_new_password"
          rules={[{ required: true, min: 6 }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm new password"
            iconRender={(v) => (v ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            Change password
          </Button>
          <Button disabled>Enable 2FA (soon)</Button>
        </Space>
      </Form>
    </Card>
  );
}
