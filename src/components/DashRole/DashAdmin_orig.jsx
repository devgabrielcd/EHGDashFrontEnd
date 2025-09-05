"use client";

import React from "react";
import { Row, Col, Space } from "antd";

import AdminHeader from "@/components/dash/admin/AdminHeader";
import KPIGrid from "@/components/dash/admin/KPIGrid";
import RevenueChart from "@/components/dash/admin/RevenueChart";
import RecentActivity from "@/components/dash/admin/RecentActivity";
import SystemHealth from "@/components/dash/admin/SystemHealth";
import QuickLinks from "@/components/dash/admin/QuickLinks";
import TopEntities from "@/components/dash/admin/TopEntities";

export default function DashAdmin({ user }) {
  // ✅ KPIs mockados
  const kpis = [
    { key: "total_users", title: "Total Users", value: 1280, icon: "user", color: "#1890ff" },
    { key: "h4h_users", title: "H4H Users", value: 632, icon: "team", color: "#fa8c16" },
    { key: "qol_users", title: "QoL Users", value: 743, icon: "team", color: "#722ed1" },
    { key: "reports", title: "Reports", value: 122, icon: "file", color: "#52c41a" },
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

  const topEntities = [
    { key: "1", name: "Acme Ltd", metric: 98, trend: "up" },
    { key: "2", name: "Globex", metric: 86, trend: "down" },
    { key: "3", name: "Umbrella", metric: 74, trend: "up" },
    { key: "4", name: "Initech", metric: 66, trend: "flat" },
  ];
        console.log("DashAdminLog", user);
  return (
    <div className="admin-scale-lg">
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <AdminHeader user={user} />

        

        <KPIGrid items={kpis} />

        {/* Primeira linha */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={15}>
            <RevenueChart title="Clients Added (last 12 months)" />
          </Col>
          <Col xs={24} lg={9}>
            <SystemHealth />
          </Col>
        </Row>

    {/* Segunda linha */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={15}>
            <RecentActivity items={activity} />
          </Col>
          <Col xs={24} lg={9}>
            <QuickLinks items={links} />
          </Col>
        </Row>
        <TopEntities items={topEntities} />
      </Space>

      <style jsx global>{`
        .admin-scale-lg .ant-card .anticon {
          font-size: 28px; /* ícones maiores */
        }
      `}</style>
    </div>
  );
}
