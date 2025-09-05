"use client";

import React, { useMemo, useState } from "react";
import { Card, Space, Typography, Switch, Form, Select, Button, message } from "antd";
import { BellOutlined } from "@ant-design/icons";
import SectionTitle from "./SectionTitle";
import { callAPI } from "./api";

const { Text } = Typography;

export default function NotificationsCard() {
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState({
    email: true,
    push: false,
    inapp: true,
    digest: "daily",
  });

  const cardStyle = useMemo(
    () => ({ background: "var(--bg-panel)", borderColor: "var(--border-strong)" }),
    []
  );

  const save = async () => {
    try {
      setLoading(true);
      await callAPI("/api/notifications/prefs/", prefs);
      message.success("Notification preferences saved!");
    } catch {
      message.error("Could not save notification preferences.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={<SectionTitle icon={<BellOutlined />}>Notifications</SectionTitle>} style={cardStyle}>
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Space style={{ justifyContent: "space-between", width: "100%" }}>
          <Text>Email alerts</Text>
          <Switch
            checked={prefs.email}
            onChange={(v) => setPrefs((s) => ({ ...s, email: v }))}
          />
        </Space>
        <Space style={{ justifyContent: "space-between", width: "100%" }}>
          <Text>Push notifications</Text>
          <Switch
            checked={prefs.push}
            onChange={(v) => setPrefs((s) => ({ ...s, push: v }))}
          />
        </Space>
        <Space style={{ justifyContent: "space-between", width: "100%" }}>
          <Text>In-app messages</Text>
          <Switch
            checked={prefs.inapp}
            onChange={(v) => setPrefs((s) => ({ ...s, inapp: v }))}
          />
        </Space>

        <Form layout="vertical" onFinish={save}>
          <Form.Item label="Digest frequency">
            <Select
              value={prefs.digest}
              onChange={(v) => setPrefs((s) => ({ ...s, digest: v }))}
              options={[
                { value: "never", label: "Never" },
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
              ]}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save notifications
          </Button>
        </Form>
      </Space>
    </Card>
  );
}
