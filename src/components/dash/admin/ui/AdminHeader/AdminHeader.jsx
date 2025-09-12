// components/dash/admin/AdminHeader.jsx
// SERVER COMPONENT
import React from "react";
import { Card, Space, Tag } from "antd";
import { auth } from "@/auth";

const API_BASE = process.env.BACKEND_BASE_URL ?? "http://localhost:8000";

export default async function AdminHeader() {
  const session = await auth();
  const user = session?.user;

  // Nome completo a partir do payload do next-auth (se existir)
  const fullName =
    [user?.details?.first_name, user?.details?.middle_name, user?.details?.last_name]
      .filter(Boolean)
      .join(" ") || user?.name || user?.user || "User";

  // Por padrão mostramos os dados do session.user.details
  let roleLabel = user?.details?.user_role || user?.details?.role || null;
  let typeLabel = user?.details?.user_type || user?.details?.type || null;
  let emailLabel = user?.details?.email || user?.email || null;
  let phoneLabel = user?.details?.phone_number || null;

  // Se tivermos accessToken + email, buscamos o row real no /api/users/?q=<email>
  if (session?.accessToken && (user?.email || user?.details?.email)) {
    const q = encodeURIComponent(user?.email || user?.details?.email);
    try {
      const res = await fetch(`${API_BASE}/api/users/?q=${q}`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (res.ok) {
        const arr = await res.json();
        const me =
          Array.isArray(arr) &&
          arr.find((r) => (r?.email || "").toLowerCase() === (user?.email || user?.details?.email || "").toLowerCase());

        if (me) {
          // Preferimos os campos do endpoint novo
          roleLabel = me.user_role ?? me.insuranceCoverage ?? roleLabel;
          typeLabel = me.user_type ?? me.coverageType ?? typeLabel;
          emailLabel = me.email ?? emailLabel;
          phoneLabel = me.phone ?? phoneLabel;
        }
      }
    } catch (e) {
      // silencioso, usamos os dados do session
      console.error("AdminHeader: falha ao consultar /api/users/?q=", e);
    }
  }

  const labelStyle = { color: "#6b7280", fontSize: 14 };

  return (
    <Card>
      <Space direction="vertical" size={6} style={{ width: "100%" }}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
          Welcome, {fullName}
        </h3>

        <Space wrap>
          {typeLabel ? <Tag color="geekblue">{String(typeLabel).toUpperCase()}</Tag> : null}
          {roleLabel ? <Tag color="purple">{String(roleLabel).toUpperCase()}</Tag> : null}

          {emailLabel ? <span style={labelStyle}>Email: {emailLabel}</span> : null}
          {phoneLabel ? <span style={labelStyle}>Phone: {phoneLabel}</span> : null}
        </Space>
      </Space>
    </Card>
  );
}
