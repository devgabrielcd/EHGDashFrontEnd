"use client";

import React from "react";
import { Typography, Table, Button, Space, Tag } from "antd";
import { PlusOutlined, FileAddOutlined } from "@ant-design/icons";
import Link from "next/link";

const { Title } = Typography;

const MOCK_REPORTS = [
  { id: "rpt-101", name: "Monthly Sales", type: "Sales", status: "Active" },
  { id: "rpt-102", name: "User Growth", type: "Users", status: "Draft" },
  { id: "rpt-103", name: "NPS Weekly", type: "Satisfaction", status: "Scheduled" },
];

export default function ReportsPage() {
  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Type", dataIndex: "type", key: "type" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => {
        const color =
          s === "Active" ? "green" : s === "Draft" ? "orange" : "blue";
        return <Tag color={color}>{s}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Link href={`/dashboard/reports/${record.id}`}>
            <Button type="link">View</Button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Space
        align="center"
        style={{ justifyContent: "space-between", width: "100%" }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Reports
        </Title>
        <Space>
          <Link href="/dashboard/reports/templates">
            <Button type="default" icon={<FileAddOutlined />}>
              Templates
            </Button>
          </Link>
          <Link href="/dashboard/reports/new">
            <Button type="primary" icon={<PlusOutlined />}>
              New report
            </Button>
          </Link>
        </Space>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={MOCK_REPORTS}
        pagination={false}
      />
    </Space>
  );
}
