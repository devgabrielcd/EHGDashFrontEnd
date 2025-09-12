// SERVER COMPONENT
import React from "react";
import { Row, Col, Space } from "antd";

import AdminHeader from "@/components/dash/admin/ui/AdminHeader/AdminHeader";
import KPIGrid from "@/components/dash/admin/ui/KPIGrid/KPIGrid";
import RecentActivity from "@/components/dash/admin/ui/RecentActivity/RecentActivityClient";
import SystemHealth from "@/components/dash/admin/ui/SystemHealth/SystemHealth";
import QuickLinks from "@/components/dash/admin/ui/QuickLinks/QuickLinks";

// versões SERVER → (elas mesmas chamam os clients só para renderizar UI)
import TopEntitiesServer from "@/components/dash/admin/ui/TopEntities/TopEntitiesServer";
import RevenueChartServer from "@/components/dash/admin/ui/RevenueCharts/RevenueChartServer";

import styles from "./dash-admin.module.css";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:8000";

export default async function DashAdmin({
  company = "all",
  view = "insurance",
}) {
  // 1) KPIs reais
  let stats = { total_users: 0, h4h_users: 0, qol_users: 0 };
  try {
    const res = await fetch(`${API_BASE}/sheets/stats/`, { cache: "no-store" });
    if (res.ok) stats = await res.json();
    else console.error("Erro ao buscar KPIs:", res.status, res.statusText);
  } catch (e) {
    console.error("Falha ao buscar KPIs:", e);
  }

  // 2) Cards KPI
  const kpis = [
    {
      key: "total_users",
      title: "Total Users",
      value: stats.total_users,
      icon: "user",
      color: "#1890ff",
    },
    {
      key: "h4h_users",
      title: "H4H Users",
      value: stats.h4h_users,
      icon: "team",
      color: "#fa8c16",
    },
    {
      key: "qol_users",
      title: "QoL Users",
      value: stats.qol_users,
      icon: "team",
      color: "#722ed1",
    },
    {
      key: "reports",
      title: "Reports",
      value: 122, // mock por enquanto
      icon: "file",
      color: "#52c41a",
    },
  ];

  // 3) Mocks mantidos
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
            {/* Server prepara dados (com token) e o Client (Recharts) só renderiza */}
            <RevenueChartServer title="Clients Added" months={12} company={company} />
          </Col>
          <Col xs={24} lg={9}>
            {/* Filtros ativos via URL (company/view) */}
            <SystemHealth company={company} view={view} />
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={15}>
            <RecentActivity items={activity} />
          </Col>
          <Col xs={24} lg={9}>
            <QuickLinks items={links} />
          </Col>
        </Row>

        {/* Lista recente de usuários com filtro por empresa (server → client) */}
        <TopEntitiesServer company={company} />
      </Space>
    </div>
  );
}
