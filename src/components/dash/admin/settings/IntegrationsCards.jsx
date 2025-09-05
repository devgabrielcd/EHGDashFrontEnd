"use client";

import React, { useMemo, useState } from "react";
import { Card, Space, Typography, Button, Tag } from "antd";
import { ApiOutlined, GithubOutlined, GoogleOutlined } from "@ant-design/icons";
import SectionTitle from "./SectionTitle";

const { Text } = Typography;

export default function IntegrationsCard() {
  const [integrations, setIntegrations] = useState([
    { key: "google", name: "Google", icon: <GoogleOutlined />, connected: false },
    { key: "github", name: "GitHub", icon: <GithubOutlined />, connected: true },
    { key: "webhooks", name: "Webhooks", icon: <ApiOutlined />, connected: false },
  ]);

  const cardStyle = useMemo(
    () => ({ background: "var(--bg-panel)", borderColor: "var(--border-strong)" }),
    []
  );

  const toggle = (key) => {
    setIntegrations((xs) =>
      xs.map((i) => (i.key === key ? { ...i, connected: !i.connected } : i))
    );
  };

  return (
    <Card title={<SectionTitle icon={<ApiOutlined />}>Integrations</SectionTitle>} style={cardStyle}>
      <Space direction="vertical" style={{ width: "100%" }}>
        {integrations.map((it) => (
          <Card
            key={it.key}
            size="small"
            style={{ background: "transparent", borderColor: "var(--border-strong)" }}
          >
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Space>
                {it.icon}
                <Text>{it.name}</Text>
                {it.connected ? <Tag color="green">Connected</Tag> : <Tag>Disconnected</Tag>}
              </Space>
              <Button onClick={() => toggle(it.key)}>
                {it.connected ? "Disconnect" : "Connect"}
              </Button>
            </Space>
          </Card>
        ))}
      </Space>
    </Card>
  );
}
