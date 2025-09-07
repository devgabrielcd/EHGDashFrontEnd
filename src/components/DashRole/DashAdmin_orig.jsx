// components/DashRole/DashAdmin.jsx
"use client";

import React from "react";
import { Row, Col, Space } from "antd";
import { useRouter } from "next/navigation";

import AdminHeader from "@/components/dash/admin/AdminHeader";
import AdminKpiStats from "@/components/dash/admin/AdminKpiStats";
import UsersTrendChart from "@/components/dash/admin/UsersTrendChart";
import TopEntities from "@/components/dash/admin/TopEntities";

// (opcionais — mantém seus widgets atuais)
import SystemHealth from "@/components/dash/admin/SystemHealth";
import QuickLinks from "@/components/dash/admin/QuickLinks";

import { useUsersFeed } from "@/components/dash/admin/hooks/useUsersFeed";
import styles from "./dash-admin.module.css";

export default function DashAdmin() {
  const router = useRouter();

  // 🔌 único ponto de dados da home: tudo vem do /api/users/ com Bearer next-auth
  const { totals, weekly, loading } = useUsersFeed();

  // seus quick links antigos (ajuste rotas se quiser)
  const links = [
    { title: "Manage Users", href: "/dashboard/admin/user-accounts", icon: "user", color: "#1890ff" },
    { title: "Teams & Permissions", href: "/dashboard/admin/teams", icon: "team", color: "#fa8c16" },
    { title: "Reports", href: "/dashboard/admin/reports", icon: "file", color: "#722ed1" },
    { title: "Settings", href: "/dashboard/admin/settings", icon: "setting", color: "#52c41a" },
  ];

  return (
    <div className={styles.adminScaleLg}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {/* Header já conectado ao feed e com atalhos */}
        <AdminHeader
          onGoUsers={() => router.push("/dashboard/admin/user-accounts")}
          onGoTeams={() => router.push("/dashboard/admin/teams")}
          onGoSettings={() => router.push("/dashboard/admin/settings")}
        />

        {/* KPIs (Total, Active, ranking de role/type/company) */}
        <AdminKpiStats totals={totals} loading={loading} />

        <Row gutter={[16, 16]}>
          {/* Gráfico semanal de cadastros */}
          <Col xs={24} lg={15}>
            <UsersTrendChart weekly={weekly} loading={loading} />
          </Col>

          {/* Seus widgets extras continuam valendo */}
          <Col xs={24} lg={9}>
            <SystemHealth />
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={15}>
            {/* Tabela “Latest users” (já migrada para /api/users/ no nosso ajuste anterior) */}
            <TopEntities />
          </Col>
          <Col xs={24} lg={9}>
            <QuickLinks items={links} />
          </Col>
        </Row>
      </Space>
    </div>
  );
}
