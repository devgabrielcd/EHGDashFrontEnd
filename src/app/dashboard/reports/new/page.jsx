"use client";

import React from "react";
import { Typography, Table, Button, Space, Tag } from "antd";
import { FileAddOutlined, PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Title } = Typography;

const TEMPLATES = [
  { id: "users_overview", name: "Users Overview", type: "Users", status: "Draft" },
  { id: "monthly_sales",  name: "Monthly Sales",  type: "Sales", status: "Draft" },
  { id: "nps_weekly",     name: "NPS Weekly",     type: "Satisfaction", status: "Scheduled" },
];

export default function NewReportPage() {
  const router = useRouter();

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Type", dataIndex: "type" },
    { title: "Status", dataIndex: "status", render: (s) => <Tag>{s}</Tag> },
    {
      title: "Action",
      render: (_, r) => (
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push(`/dashboard/reports/new/builder?template=${r.id}&type=${r.type}`)}
          >
            Create
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
        <Title level={3} style={{ margin: 0 }}>Reports</Title>
        <Button icon={<FileAddOutlined />} onClick={() => router.push("/dashboard/reports/templates")}>
          Templates
        </Button>
      </Space>

      <Table rowKey="id" columns={columns} dataSource={TEMPLATES} pagination={false} />
    </Space>
  );
}
