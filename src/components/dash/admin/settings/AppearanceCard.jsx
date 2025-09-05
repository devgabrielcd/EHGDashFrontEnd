"use client";

import React, { useMemo } from "react";
import { Card, Space, Typography, Button } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import SectionTitle from "./SectionTitle";
import { useTheme } from "next-themes";

const { Text } = Typography;

export default function AppearanceCard() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const cardStyle = useMemo(
    () => ({ background: "var(--bg-panel)", borderColor: "var(--border-strong)" }),
    []
  );

  return (
    <Card
      title={
        <SectionTitle icon={isDark ? <MoonOutlined /> : <SunOutlined />}>
          Appearance
        </SectionTitle>
      }
      style={cardStyle}
    >
      <Space direction="vertical">
        <Text>Theme</Text>
        <Space>
          <Button
            icon={<SunOutlined />}
            type={!isDark ? "primary" : "default"}
            onClick={() => setTheme("light")}
          >
            Light
          </Button>
        </Space>
        <Space>
          <Button
            icon={<MoonOutlined />}
            type={isDark ? "primary" : "default"}
            onClick={() => setTheme("dark")}
          >
            Dark
          </Button>
        </Space>
        <Text type="secondary">
          Your preference is saved per-browser using next-themes.
        </Text>
      </Space>
    </Card>
  );
}
