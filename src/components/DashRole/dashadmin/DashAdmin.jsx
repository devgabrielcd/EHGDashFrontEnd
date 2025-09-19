// src/components/DashRole/dashadmin/DashAdmin.jsx
import React from "react";
import { Row, Col, Space } from "antd";
import { auth } from "@/auth";

import AdminHeader from "@/components/dash/admin/ui/AdminHeader/AdminHeader";
import KPIGrid from "@/components/dash/admin/ui/KPIGrid/KPIGrid";
import QuickLinks from "@/components/dash/admin/ui/QuickLinks/QuickLinks";
import TopEntitiesServer from "@/components/dash/admin/ui/TopEntities/TopEntitiesServer";
import RevenueChartServer from "@/components/dash/admin/ui/RevenueCharts/RevenueChartServer";
import RecentActivityServer from "@/components/dash/admin/ui/RecentActivity/RecentActivityServer";
import SystemHealth from "@/components/dash/admin/ui/SystemHealth/SystemHealth";

import styles from "./dash-admin.module.css";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:8000";

async function fetchJSON(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} - ${txt || res.statusText}`);
  }
  return res.json();
}

export default async function DashAdmin({
  sysCompany = "all",
  sysView = "insurance", // "insurance" | "planTypes" | "formTypes"
  revPeriod = 12,
  teCompany = "all",
  kpiCompany = "all",   // filtro opcional pros KPIs
  revCompany = "all",   // ⬅️ receber da page e repassar ao gráfico
} = {}) {
  const session = await auth();

  // ---- KPIs: /api/user-stats/ ----
  const kpiQs = new URLSearchParams();
  if (kpiCompany && kpiCompany !== "all") {
    kpiQs.set("company", String(kpiCompany));
  }
  const kpiUrl = `${API_BASE}/api/user-stats/${kpiQs.toString() ? `?${kpiQs}` : ""}`;

  let stats = {
    total_users: 0,
    h4h_users: 0,
    qol_users: 0,
    by_company: [],
  };

  try {
    stats = await fetchJSON(kpiUrl, {
      cache: "no-store",
      headers: session?.accessToken
        ? { Authorization: `Bearer ${session.accessToken}` }
        : undefined,
    });
  } catch (e) {
    console.error("Falha ao carregar KPIs:", e?.message);
  }

  const kpis = [
    {
      key: "total_users",
      title: "Total Users",
      value: stats?.total_users ?? 0,
      icon: "user",
      color: "#1890ff",
    },
    {
      key: "h4h_users",
      title: "H4H Users",
      value: stats?.h4h_users ?? 0,
      icon: "team",
      color: "#fa8c16",
    },
    {
      key: "qol_users",
      title: "QoL Users",
      value: stats?.qol_users ?? 0,
      icon: "team",
      color: "#722ed1",
    },
    {
      key: "reports",
      title: "Reports",
      value: 122, // placeholder até ligar fonte real
      icon: "file",
      color: "#52c41a",
    },
  ];

  const activity = [
    { time: "Today 10:24", text: "Backup completed", color: "green" },
    { time: "Yesterday 17:03", text: "Deploy v1.4.2 to production", color: "blue" },
    { time: "Yesterday 16:21", text: "2 alerts resolved", color: "gray" },
    { time: "Yesterday 11:00", text: "New user (Employee02)", color: "green" },
  ];

  const links = [
    { title: "Manage Users", href: "/settings/users", icon: "user", color: "#1890ff" },
    { title: "Teams & Permissions", href: "/settings/team", icon: "team", color: "#fa8c16" },
    { title: "Reports", href: "/reports", icon: "file", color: "#722ed1" },
    { title: "Settings", href: "/settings", icon: "setting", color: "#52c41a" },
  ];

  return (
    <div className={styles.adminScaleLg}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <AdminHeader />
        <KPIGrid items={kpis} />

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={15}>
            {/* ⬇️ agora o gráfico respeita o filtro por company */}
            <RevenueChartServer
              title="Clients Added"
              months={revPeriod}
              company={revCompany}
            />
          </Col>
          <Col xs={24} lg={9}>
            <SystemHealth company={sysCompany} view={sysView} />
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={15}>
            {/* sua lista estática enquanto conecta RecentActivityServer */}
            <RecentActivityServer title="Recent Activities" company="all" limit={12} height={220} />
          </Col>
          <Col xs={24} lg={9}>
            <QuickLinks items={links} />
          </Col>
        </Row>

        <TopEntitiesServer company={teCompany} />
      </Space>
    </div>
  );
}
