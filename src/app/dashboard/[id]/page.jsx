"use client";

import React from "react";
import { Card, Space, Typography, Button, Tag } from "antd";
import { ArrowLeftOutlined, DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import Link from "next/link";

const { Title, Text } = Typography;

export default function ReportDetailPage({ params }) {
  const { id } = params || {};

  // mock simples encontrando pelo id
  const report =
    {
      id,
      name: "Monthly Sales",
      type: "Sales",
      status: "Ready",
      owner: "Alice",
      updatedAt: "2025-08-31",
      description:
        "Mocked detail page. Here we will render charts/tables for the report.",
    };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
        <Space>
          <Link href="/dashboard/reports">
            <Button icon={<ArrowLeftOutlined />}>Back</Button>
          </Link>
          <Title level={3} style={{ margin: 0 }}>
            {report.name}
          </Title>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />}>Refresh</Button>
          <Button icon={<DownloadOutlined />}>Download (.csv)</Button>
        </Space>
      </Space>

      <Card>
        <Space direction="vertical" size={6}>
          <Text>
            <b>ID:</b> {report.id}
          </Text>
          <Text>
            <b>Type:</b> {report.type}
          </Text>
          <Text>
            <b>Status:</b>{" "}
            {report.status === "Ready" ? <Tag color="green">Ready</Tag> : <Tag>{report.status}</Tag>}
          </Text>
          <Text>
            <b>Owner:</b> {report.owner}
          </Text>
          <Text type="secondary">
            Last updated: {report.updatedAt}
          </Text>
        </Space>
      </Card>

      <Card>
        <Title level={4}>Preview</Title>
        <Text type="secondary">
          This is just a placeholder. Later we’ll plug charts/tables here.
        </Text>
        <div
          style={{
            marginTop: 12,
            height: 260,
            border: "1px dashed var(--ant-color-border)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.7,
          }}
        >
          Report content preview
        </div>
      </Card>
    </Space>
  );
}
