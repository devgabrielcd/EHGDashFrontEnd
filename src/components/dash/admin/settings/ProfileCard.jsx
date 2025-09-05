"use client";

import React, { useMemo, useState } from "react";
import { Card, Form, Input, Space, Button, Tag, Typography, Avatar, message } from "antd";
import { UserOutlined, MailOutlined, MobileOutlined } from "@ant-design/icons";
import SectionTitle from "./SectionTitle";
import { useSession } from "next-auth/react";
import { callAPI } from "./api";

const { Text } = Typography;

export default function ProfileCard() {
  const { data: session } = useSession();
  const user = session?.user || {};
  const details = user?.details || {};
  const firstName = details.first_name || user.first_name || user.name || "User";
  const email = details.email || user.email || "";

  const [loading, setLoading] = useState(false);

  const initial = {
    first_name: details.first_name || user.first_name || "",
    last_name: details.last_name || user.last_name || "",
    email: email || "",
    phone: details.phone_number || "",
  };

  const cardStyle = useMemo(
    () => ({ background: "var(--bg-panel)", borderColor: "var(--border-strong)" }),
    []
  );

  const onSave = async (values) => {
    try {
      setLoading(true);
      await callAPI("/api/profile/update/", values);
      message.success("Profile updated!");
    } catch {
      message.error("Could not update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={<SectionTitle icon={<UserOutlined />}>Profile</SectionTitle>} style={cardStyle}>
      <Space size={12} style={{ marginBottom: 16 }}>
        <Avatar size={56} icon={<UserOutlined />} />
        <div>
          <div style={{ fontWeight: 700 }}>{firstName}</div>
          {email ? <Text type="secondary">{email}</Text> : null}
        </div>
      </Space>

      <Form layout="vertical" onFinish={onSave} initialValues={initial}>
        <Form.Item label="First name" name="first_name">
          <Input prefix={<UserOutlined />} placeholder="First name" />
        </Form.Item>
        <Form.Item label="Last name" name="last_name">
          <Input prefix={<UserOutlined />} placeholder="Last name" />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ type: "email" }]}>
          <Input prefix={<MailOutlined />} placeholder="name@company.com" />
        </Form.Item>
        <Form.Item label="Phone" name="phone">
          <Input prefix={<MobileOutlined />} placeholder="+1 555 123 456" />
        </Form.Item>

        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save profile
          </Button>
          <Tag color="geekblue">
            {details.user_role ? String(details.user_role).toUpperCase() : "USER"}
          </Tag>
          {details.user_type ? (
            <Tag color="purple">{String(details.user_type).toUpperCase()}</Tag>
          ) : null}
        </Space>
      </Form>
    </Card>
  );
}
