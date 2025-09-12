"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Typography, Card, Space, Row, Col, Select, DatePicker, Button, Input, Tag, App, Alert, Divider, Empty
} from "antd";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE } from "@/lib/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// helpers
const COLORS = ["#1677ff","#52c41a","#fa8c16","#722ed1","#13c2c2","#eb2f96","#a0d911","#2f54eb","#fa541c","#08979c"];
const monthKey = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}`;
const monthLabel = (d, withYear) => {
  const m = d.toLocaleString("default", { month: "short" });
  return withYear ? `${m} ${d.getUTCFullYear()}` : m;
};
const buildMonths = (n=6) => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const arr = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - i, 1));
    arr.push({ key: monthKey(d), date: d, count: 0 });
  }
  return arr;
};
const inc = (map, key) => map.set(key, (map.get(key) ?? 0) + 1);
const toSortedArray = (map) => [...map.entries()].map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count);

// agrega conforme dimensão
function aggregate(rows, dimension, months) {
  if (dimension === "month") {
    const base = buildMonths(months);
    const idx = new Map(base.map((m, i) => [m.key, i]));
    for (const r of rows) {
      const dt = r?.datetime ? new Date(r.datetime) : null;
      if (!dt || Number.isNaN(dt.getTime())) continue;
      const k = monthKey(dt);
      const i = idx.get(k);
      if (i !== undefined) base[i].count += 1;
    }
    return base.map((m, i, arr) => ({
      name: monthLabel(m.date, i === 0 || arr[i - 1].date.getUTCFullYear() !== m.date.getUTCFullYear()),
      count: m.count
    }));
  }

  const m = new Map();
  for (const r of rows) {
    let key = "Unknown";
    if (dimension === "company") key = r.company_name ?? r.company ?? "Unknown";
    if (dimension === "zipcode") key = r.zipcode ?? r.zip ?? r.postal_code ?? r.postalCode ?? "Unknown";
    if (dimension === "plan") key = r.insuranceCoverage ?? "Unknown";
    if (dimension === "plan_type") key = r.coverageType ?? "Unknown";
    if (dimension === "form") key =
      r.formType ?? r.form_type ?? r.signupSource ?? r.signup_source ?? r.site ?? r.site_origin ?? "Unknown";
    inc(m, key || "Unknown");
  }
  return toSortedArray(m).slice(0, 20);
}

export default function ReportBuilderClient({ template, type, companies, token }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();

  const [name, setName] = useState(() => {
    const base = template?.replaceAll("_", " ") || `${type} Report`;
    return base[0].toUpperCase() + base.slice(1);
  });
  const [company, setCompany] = useState("all");
  const [months, setMonths] = useState(6);
  const [dimension, setDimension] = useState("month"); // month | company | zipcode | plan | plan_type | form
  const [chart, setChart] = useState("line"); // line | bar | pie
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // carregar dados dos usuários (flat) para agregação client-side
  async function loadData() {
    try {
      setLoading(true);
      setErr("");
      const url = new URL(`${API_BASE}/api/users/`);
      if (company !== "all") url.searchParams.set("company", company);
      const res = await fetch(url.toString(), {
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.detail || `HTTP ${res.status}`);
      setRows(Array.isArray(json) ? json : []);
    } catch (e) {
      setErr(String(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company]);

  const data = useMemo(() => aggregate(rows, dimension, months), [rows, dimension, months]);

  // exportar para PDF (usar ref em um elemento DOM, não no Card)
  const snapRef = useRef(null);
  const handleExportPDF = async () => {
    try {
      const node = snapRef.current;
      const canvas = await html2canvas(node, { backgroundColor: "#141414", scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
      const w = canvas.width * ratio;
      const h = canvas.height * ratio;
      const x = (pageW - w) / 2;
      const y = (pageH - h) / 2;
      pdf.addImage(imgData, "PNG", x, y, w, h);
      pdf.save(`${name.replace(/\s+/g, "_").toLowerCase()}.pdf`);
    } catch (e) {
      message.error(String(e));
    }
  };

  // salvar relatório no Django
  const handleSave = async () => {
    try {
      const payload = {
        name,
        type,
        status: "Ready",
        config: {
          template,
          filters: { company, months },
          dimension,
          chart,
        },
      };
      const res = await fetch(`${API_BASE}/api/reports/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.detail || `HTTP ${res.status}`);
      message.success("Report saved!");
      router.push(`/dashboard/reports/${json.id}`);
    } catch (e) {
      message.error(String(e));
    }
  };

  // ---- NOVO: função para renderizar o chart garantindo um filho válido do ResponsiveContainer
  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div style={{ height: 360, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Empty description="No data to display" />
        </div>
      );
    }

    if (chart === "line") {
      return (
        <div style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#1677ff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (chart === "bar") {
      return (
        <div style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count">
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (chart === "pie") {
      return (
        <div style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie
                data={data}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={130}
                label
              >
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }

    // fallback seguro
    return (
      <div style={{ height: 360, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Empty description="Select a chart type" />
      </div>
    );
  };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Report Builder</Title>
          <Text type="secondary">Template: {template} — Type: {type}</Text>
        </div>
        <Space>
          <Button onClick={handleExportPDF} disabled={loading}>Export PDF</Button>
          <Button type="primary" onClick={handleSave} disabled={loading}>Save report</Button>
        </Space>
      </Space>

      {err && <Alert type="error" showIcon message="Failed to load data" description={err} />}

      <Card>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <Input value={name} onChange={(e) => setName(e.target.value)} addonBefore="Name" />
          </Col>
          <Col xs={24} md={6}>
            <Select
              style={{ width: "100%" }}
              value={company}
              onChange={setCompany}
              options={companies}
              popupMatchSelectWidth={240}
            />
          </Col>
          <Col xs={24} md={4}>
            <Select
              style={{ width: "100%" }}
              value={months}
              onChange={setMonths}
              options={[
                { label: "Last 3 months", value: 3 },
                { label: "Last 6 months", value: 6 },
                { label: "Last 9 months", value: 9 },
                { label: "Last 12 months", value: 12 },
              ]}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              style={{ width: "100%" }}
              value={dimension}
              onChange={setDimension}
              options={[
                { label: "By Month", value: "month" },
                { label: "By Company", value: "company" },
                { label: "By Zipcode", value: "zipcode" },
                { label: "By Plan (Coverage)", value: "plan" },
                { label: "By Plan Type", value: "plan_type" },
                { label: "By Form Source", value: "form" },
              ]}
            />
          </Col>
          <Col xs={24} md={4}>
            <Select
              style={{ width: "100%" }}
              value={chart}
              onChange={setChart}
              options={[
                { label: "Line", value: "line" },
                { label: "Bar", value: "bar" },
                { label: "Pie", value: "pie" },
              ]}
            />
          </Col>
        </Row>
      </Card>

      <Card styles={{ body: { padding: 16 } }}>
        <div ref={snapRef}>
          <Space direction="vertical" style={{ width: "100%" }} size={8}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text strong>
                Preview — {name} {company !== "all" ? <Tag>Company {company}</Tag> : null}
              </Text>
              <Text type="secondary">{rows.length} users</Text>
            </div>
            <Divider style={{ margin: "8px 0" }} />
            {renderChart()}
          </Space>
        </div>
      </Card>
    </Space>
  );
}
