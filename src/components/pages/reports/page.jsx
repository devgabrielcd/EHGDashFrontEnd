"use client";

import React, { useMemo, useState } from "react";
import {
  Typography,
  Row,
  Col,
  Card,
  Tabs,
  Input,
  Select,
  DatePicker,
  Button,
  Tag,
  Table,
  Space,
  Dropdown,
} from "antd";
import {
  FileTextOutlined,
  BarChartOutlined,
  DownloadOutlined,
  PlusOutlined,
  FilterOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import Link from "next/link";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const MOCK_REPORTS = [
  { id: "rpt-001", name: "Monthly Sales", type: "Sales", status: "Ready", owner: "Alice", updatedAt: "2025-08-31" },
  { id: "rpt-002", name: "User Growth", type: "Users", status: "Ready", owner: "Bob", updatedAt: "2025-08-29" },
  { id: "rpt-003", name: "Churn Cohorts", type: "Retention", status: "Processing", owner: "Carol", updatedAt: "2025-08-28" },
  { id: "rpt-004", name: "NPS Weekly", type: "Satisfaction", status: "Ready", owner: "Dave", updatedAt: "2025-08-27" },
  { id: "rpt-005", name: "Revenue by Region", type: "Sales", status: "Failed", owner: "Eve", updatedAt: "2025-08-25" },
];

const statusTag = (s) => {
  switch (s) {
    case "Ready":
      return <Tag color="green">Ready</Tag>;
    case "Processing":
      return <Tag color="blue">Processing</Tag>;
    case "Failed":
      return <Tag color="red">Failed</Tag>;
    default:
      return <Tag>{s}</Tag>;
  }
};

export default function Reports() {
  const [q, setQ] = useState("");
  const [type, setType] = useState(undefined);

  const filtered = useMemo(() => {
    return MOCK_REPORTS.filter((r) => {
      const hitQ = q ? r.name.toLowerCase().includes(q.toLowerCase()) : true;
      const hitType = type ? r.type === type : true;
      return hitQ && hitType;
    });
  }, [q, type]);

  const columns = [
    {
      title: "Report",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Link href={`/dashboard/reports/${record.id}`} style={{ fontWeight: 600 }}>
          {text}
        </Link>
      ),
    },
    { title: "Type", dataIndex: "type", key: "type" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: statusTag,
    },
    { title: "Owner", dataIndex: "owner", key: "owner" },
    { title: "Last Updated", dataIndex: "updatedAt", key: "updatedAt" },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: "open", label: <Link href={`/dashboard/reports/${record.id}`}>Open</Link> },
              { key: "download", label: "Download (.csv)" },
              { type: "divider" },
              { key: "schedule", label: "Schedule…" },
              { key: "duplicate", label: "Duplicate" },
            ],
          }}
          trigger={["click"]}
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Reports
          </Title>
          <Text type="secondary">Explore, generate and schedule reports.</Text>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />}>Export</Button>
          <Link href="/dashboard/reports/new">
            <Button type="primary" icon={<PlusOutlined />}>
              New report
            </Button>
          </Link>
        </Space>
      </div>

      {/* Stats cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Space>
              <BarChartOutlined style={{ fontSize: 28 }} />
              <div>
                <Text type="secondary">Ready</Text>
                <div style={{ fontSize: 22, fontWeight: 700 }}>
                  {MOCK_REPORTS.filter((r) => r.status === "Ready").length}
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Space>
              <FileTextOutlined style={{ fontSize: 28 }} />
              <div>
                <Text type="secondary">Total</Text>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{MOCK_REPORTS.length}</div>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Space>
              <FilterOutlined style={{ fontSize: 28 }} />
              <div>
                <Text type="secondary">Processing</Text>
                <div style={{ fontSize: 22, fontWeight: 700 }}>
                  {MOCK_REPORTS.filter((r) => r.status === "Processing").length}
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Space>
              <BarChartOutlined style={{ fontSize: 28 }} />
              <div>
                <Text type="secondary">Failed</Text>
                <div style={{ fontSize: 22, fontWeight: 700 }}>
                  {MOCK_REPORTS.filter((r) => r.status === "Failed").length}
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Tabs
        defaultActiveKey="all"
        items={[
          {
            key: "all",
            label: "All reports",
            children: (
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                {/* Filters */}
                <Card>
                  <Row gutter={[12, 12]} align="middle">
                    <Col xs={24} md={8}>
                      <Input
                        placeholder="Search by name…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                      />
                    </Col>
                    <Col xs={24} md={6}>
                      <Select
                        allowClear
                        placeholder="Type"
                        value={type}
                        onChange={setType}
                        style={{ width: "100%" }}
                        options={[
                          { value: "Sales", label: "Sales" },
                          { value: "Users", label: "Users" },
                          { value: "Retention", label: "Retention" },
                          { value: "Satisfaction", label: "Satisfaction" },
                        ]}
                      />
                    </Col>
                    <Col xs={24} md={8}>
                      <RangePicker style={{ width: "100%" }} />
                    </Col>
                    <Col xs={24} md={2} style={{ textAlign: "right" }}>
                      <Button>Reset</Button>
                    </Col>
                  </Row>
                </Card>

                {/* Table */}
                <Card>
                  <Table
                    rowKey="id"
                    dataSource={filtered}
                    columns={columns}
                    pagination={{ pageSize: 8 }}
                  />
                </Card>
              </Space>
            ),
          },
          {
            key: "scheduled",
            label: "Scheduled",
            children: (
              <Card>
                <Text type="secondary">No scheduled reports yet.</Text>
              </Card>
            ),
          },
          {
            key: "templates",
            label: "Templates",
            children: (
              <Row gutter={[16, 16]}>
                {["Sales Overview", "User Growth", "Churn Cohort"].map((t) => (
                  <Col key={t} xs={24} sm={12} lg={8}>
                    <Card
                      title={t}
                      actions={[<Button type="link" key="use">Use template</Button>]}
                    >
                      <Text type="secondary">
                        Prebuilt layout to accelerate new reports.
                      </Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            ),
          },
        ]}
      />
    </Space>
  );
}
