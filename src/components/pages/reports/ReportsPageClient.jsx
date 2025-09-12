"use client";
import React, { useMemo } from "react";
import { Typography, Row, Col, Card, Tabs, Input, Select, DatePicker, Button, Table, Tag, Space, Dropdown, Alert } from "antd";
import { DownloadOutlined, PlusOutlined, MoreOutlined, BarChartOutlined, FileTextOutlined, FilterOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function ReportsPageClient({ stats, list, types, error }) {
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname();

  const qInit = sp.get("q") ?? "";
  const typeInit = sp.get("type") ?? undefined;
  const fromInit = sp.get("from") ?? "";
  const toInit = sp.get("to") ?? "";

  const setParam = (k, v) => {
    const next = new URLSearchParams(sp.toString());
    if (!v) next.delete(k); else next.set(k, v);
    next.set("page", "1");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const columns = [
    {
      title: "Report",
      dataIndex: "name",
      render: (text, record) => <Link href={`/dashboard/reports/${record.id}`}>{text}</Link>,
    },
    { title: "Type", dataIndex: "type" },
    {
      title: "Status",
      dataIndex: "status",
      render: (s) => {
        const color = s === "Ready" || s === "Active" ? "green" : s === "Failed" ? "red" : "blue";
        return <Tag color={color}>{s}</Tag>;
      },
    },
    { title: "Owner", dataIndex: "owner" },
    { title: "Last Updated", dataIndex: "updated_at" },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Dropdown
          trigger={["click"]}
          menu={{
            items: [
              { key: "open", label: <Link href={`/dashboard/reports/${record.id}`}>Open</Link> },
              { key: "download", label: <a href={`/api/proxy/reports/${record.id}/export`} target="_blank">Download (.csv)</a> },
            ],
          }}
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const ready = stats?.ready ?? 0, total = stats?.total ?? 0, processing = stats?.processing ?? 0, failed = stats?.failed ?? 0;

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Reports</Title>
          <Text type="secondary">Explore, generate and schedule reports.</Text>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />}>Export</Button>
          <Link href="/dashboard/reports/new"><Button type="primary" icon={<PlusOutlined />}>New report</Button></Link>
        </Space>
      </div>

      {error && <Alert type="error" message="Failed to load reports" description={error} showIcon />}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}><Card><Space><BarChartOutlined style={{fontSize:28}}/><div><Text type="secondary">Ready</Text><div style={{fontSize:22,fontWeight:700}}>{ready}</div></div></Space></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Space><FileTextOutlined style={{fontSize:28}}/><div><Text type="secondary">Total</Text><div style={{fontSize:22,fontWeight:700}}>{total}</div></div></Space></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Space><FilterOutlined style={{fontSize:28}}/><div><Text type="secondary">Processing</Text><div style={{fontSize:22,fontWeight:700}}>{processing}</div></div></Space></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Space><BarChartOutlined style={{fontSize:28}}/><div><Text type="secondary">Failed</Text><div style={{fontSize:22,fontWeight:700}}>{failed}</div></div></Space></Card></Col>
      </Row>

      <Tabs
        defaultActiveKey="all"
        items={[
          {
            key: "all",
            label: "All reports",
            children: (
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Card>
                  <Row gutter={[12, 12]} align="middle">
                    <Col xs={24} md={8}>
                      <Input defaultValue={qInit} placeholder="Search by name…" onPressEnter={(e) => setParam("q", e.currentTarget.value)} allowClear />
                    </Col>
                    <Col xs={24} md={6}>
                      <Select
                        allowClear
                        placeholder="Type"
                        defaultValue={typeInit}
                        style={{ width: "100%" }}
                        options={types}
                        onChange={(v) => setParam("type", v)}
                      />
                    </Col>
                    <Col xs={24} md={8}>
                      <RangePicker
                        style={{ width: "100%" }}
                        onChange={(_, [f, t]) => { setParam("from", f); setParam("to", t); }}
                      />
                    </Col>
                    <Col xs={24} md={2} style={{ textAlign: "right" }}>
                      <Button onClick={() => router.push(pathname)}>Reset</Button>
                    </Col>
                  </Row>
                </Card>

                <Card>
                  <Table
                    rowKey="id"
                    dataSource={list?.results ?? []}
                    columns={columns}
                    pagination={{
                      pageSize: list?.page_size ?? 10,
                      current: list?.page ?? 1,
                      total: list?.count ?? 0,
                      onChange: (p) => setParam("page", String(p)),
                    }}
                  />
                </Card>
              </Space>
            ),
          },
          { key: "scheduled", label: "Scheduled", children: <Card><Text type="secondary">No scheduled reports yet.</Text></Card> },
          { key: "templates", label: "Templates", children: <Card><Text>Open “New report” to choose a template.</Text></Card> },
        ]}
      />
    </Space>
  );
}
