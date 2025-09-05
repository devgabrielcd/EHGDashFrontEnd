"use client";

import React from "react";
import { Space, Typography } from "antd";
const { Title } = Typography;

export default function SectionTitle({ icon, children }) {
  return (
    <Space align="center" size={8} style={{ marginBottom: 8 }}>
      {icon}
      <Title level={4} style={{ margin: 0 }}>
        {children}
      </Title>
    </Space>
  );
}
