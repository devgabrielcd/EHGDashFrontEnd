// src/components/pages/reports/Reports.jsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Typography, Row, Col, Card, Tabs, Input, Select, DatePicker,
  Button, Tag, Table, Space, Dropdown, App,
} from "antd";
import {
  FileTextOutlined, BarChartOutlined, DownloadOutlined, PlusOutlined,
  FilterOutlined, MoreOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:8000";

const statusTag = (s) => {
  const map = { Ready: "green", Processing: "blue", Failed: "red", Active: "green", Draft: "orange", Scheduled: "blue" };
  return <Tag color={map[s] ?? "default"}>{s}</Tag>;
};

function fmt(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function fetchJSON(url, token) {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);
  return data;
}

export default function Reports({ initialQuery }) {
  const { message } = App.useApp?.() ?? { message: { error: console.error, success: () => {} } };
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL state (persistente)
  const [q, setQ] = useState(initialQuery?.q ?? "");
  const [type, setType] = useState(initialQuery?.type || "");
  const [dates, setDates] = useState(() => {
    const from = initialQuery?.dateFrom || "";
    const to = initialQuery?.dateTo || "";
    return from && to ? [dayjsSafe(from), dayjsSafe(to)] : null;
  });
  const [page, setPage] = useState(initialQuery?.page ?? 1);
  const [pageSize, setPageSize] = useState(initialQuery?.pageSize ?? 10);

  // Data
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [types, setTypes] = useState([]); // tipos de report do backend
  const [stats, setStats] = useState({ ready: 0, total: 0, processing: 0, failed: 0 });
  const token = session?.accessToken;

  function dayjsSafe(s) {
    // lazy parser local sem lib
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  const pushQuery = useCallback((patch) => {
    const sp = new URLSearchParams(searchParams.toString());
    const merge = {
      q,
      type,
      from: dates?.[0] ? fmt(dates[0]) : "",
      to: dates?.[1] ? fmt(dates[1]) : "",
      page,
      page_size: pageSize,
      ...patch,
    };
    Object.entries(merge).forEach(([k, v]) => {
      if (v === "" || v == null) sp.delete(k);
      else sp.set(k, String(v));
    });
    router.push(`${pathname}?${sp.toString()}`, { scroll: false });
  }, [searchParams, router, pathname, q, type, dates, page, pageSize]);

  const load = useCallback(async () => {
    if (status !== "authenticated" || !token) {
      if (status !== "loading") message.error("You need to be authenticated.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);

      // monta URL de listagem
      const listURL = new URL(`${API_BASE}/api/reports/`);
      if (q) listURL.searchParams.set("q", q);
      if (type) listURL.searchParams.set("type", type);
      if (dates?.[0] && dates?.[1]) {
        listURL.searchParams.set("from", fmt(dates[0]));
        listURL.searchParams.set("to", fmt(dates[1]));
      }
      listURL.searchParams.set("page", String(page));
      listURL.searchParams.set("page_size", String(pageSize));

      // busca paralela: listagem, tipos e stats
      const [listResp, typesResp, statsResp] = await Promise.all([
        fetchJSON(listURL.toString(), token).catch(() => ([])),
        fetchJSON(`${API_BASE}/api/report-types/`, token).catch(() => ([])),
        fetchJSON(`${API_BASE}/api/reports/stats/`, token).catch(() => ({})),
      ]);

      // Normaliza listagem (aceita array simples ou shape paginado)
      const items = Array.isArray(listResp?.results) ? listResp.results : Array.isArray(listResp) ? listResp : [];
      const count = Number.isFinite(listResp?.count) ? listResp.count : (Array.isArray(listResp) ? listResp.length : 0);

      setRows(items.map(n => ({
        id: n.id ?? n.slug ?? n.uuid ?? n.code,
        name: n.name ?? n.title ?? "Untitled report",
        type: n.type ?? n.category ?? "—",
        status: n.status ?? "Ready",
        owner: n.owner ?? n.created_by ?? "—",
        updatedAt: n.updated_at ?? n.updatedAt ?? n.modified_at ?? n.modifiedAt ?? n.created_at ?? n.createdAt ?? null,
      })));
      setTotal(count);

      setTypes((Array.isArray(typesResp) ? typesResp : []).map(t => ({
        label: t.label ?? t.name ?? t.type ?? String(t),
        value: t.value ?? t.name ?? t.type ?? String(t),
      })));

      setStats({
        ready: Number(statsResp?.ready ?? 0),
        total: Number(statsResp?.total ?? count),
        processing: Number(statsResp?.processing ?? 0),
        failed: Number(statsResp?.failed ?? 0),
      });
    } catch (err) {
      console.error(err);
      message.error(err.message || "Failed to load reports");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [status, token, q, type, dates, page, pageSize, message]);

  useEffect(() => { if (status === "authenticated") load(); }, [status, load]);

  const resetFilters = () => {
    setQ(""); setType(""); setDates(null); setPage(1);
    pushQuery({ q: "", type: "", from: "", to: "", page: 1 });
  };

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
    { title: "Status", dataIndex: "status", key: "status", render: statusTag },
    { title: "Owner", dataIndex: "owner", key: "owner" },
    { title: "Last Updated", dataIndex: "updatedAt", key: "updatedAt", render: (v) => fmt(v) },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, record) => {
        const menuItems = [
          { key: "open", label: <Link href={`/dashboard/reports/${record.id}`}>Open</Link> },
          {
            key: "download",
            label: "Download (.csv)",
            onClick: async () => {
              try {
                const url = `${API_BASE}/api/reports/${record.id}/export/?format=csv`;
                const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const blob = await res.blob();
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `${record.name || "report"}.csv`;
                a.click();
                URL.revokeObjectURL(a.href);
              } catch (e) {
                message.error("Failed to download CSV");
              }
            },
          },
          { type: "divider" },
          { key: "schedule", label: "Schedule…" },
          { key: "duplicate", label: "Duplicate" },
        ];
        return (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  const readyCount = stats.ready ?? 0;
  const totalCount = stats.total ?? rows.length;
  const processingCount = stats.processing ?? 0;
  const failedCount = stats.failed ?? 0;

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Reports</Title>
          <Text type="secondary">Explore, generate and schedule reports.</Text>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={() => window.print()}>Export</Button>
          <Link href="/dashboard/reports/new">
            <Button type="primary" icon={<PlusOutlined />}>New report</Button>
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
                <div style={{ fontSize: 22, fontWeight: 700 }}>{readyCount}</div>
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
                <div style={{ fontSize: 22, fontWeight: 700 }}>{totalCount}</div>
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
                <div style={{ fontSize: 22, fontWeight: 700 }}>{processingCount}</div>
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
                <div style={{ fontSize: 22, fontWeight: 700 }}>{failedCount}</div>
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
                        onPressEnter={() => { setPage(1); pushQuery({ q, page: 1 }); }}
                        allowClear
                      />
                    </Col>
                    <Col xs={24} md={6}>
                      <Select
                        allowClear
                        placeholder="Type"
                        value={type || undefined}
                        onChange={(v) => { setType(v || ""); setPage(1); pushQuery({ type: v || "", page: 1 }); }}
                        style={{ width: "100%" }}
                        options={types.length ? types : [
                          { value: "Sales", label: "Sales" },
                          { value: "Users", label: "Users" },
                          { value: "Retention", label: "Retention" },
                          { value: "Satisfaction", label: "Satisfaction" },
                        ]}
                      />
                    </Col>
                    <Col xs={24} md={8}>
                      <RangePicker
                        style={{ width: "100%" }}
                        value={dates ? [dayjsSafe(fmt(dates[0])), dayjsSafe(fmt(dates[1]))] : null}
                        onChange={(vals) => {
                          const v = vals?.length === 2 ? vals : null;
                          setDates(v);
                          setPage(1);
                          pushQuery({
                            from: v?.[0] ? fmt(v[0]) : "",
                            to: v?.[1] ? fmt(v[1]) : "",
                            page: 1,
                          });
                        }}
                      />
                    </Col>
                    <Col xs={24} md={2} style={{ textAlign: "right" }}>
                      <Button onClick={resetFilters}>Reset</Button>
                    </Col>
                  </Row>
                </Card>

                {/* Table */}
                <Card>
                  <Table
                    rowKey="id"
                    dataSource={rows}
                    columns={columns}
                    loading={loading}
                    pagination={{
                      current: page,
                      pageSize,
                      total,
                      onChange: (p, ps) => {
                        setPage(p);
                        setPageSize(ps);
                        pushQuery({ page: p, page_size: ps });
                      },
                      showSizeChanger: true,
                      pageSizeOptions: ["10", "20", "50"],
                    }}
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
                      title={<span style={{ fontWeight: 700 }}>{t}</span>}
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
