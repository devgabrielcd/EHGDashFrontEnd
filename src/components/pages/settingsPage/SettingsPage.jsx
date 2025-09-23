"use client";

import React from "react";
import { Row, Col, Space, Typography } from "antd";

import ProfileCard from "@/components/dash/admin/settings/ProfileCard";
import SecurityCard from "@/components/dash/admin/settings/SecurityCard";
import AppearanceCard from "@/components/dash/admin/settings/AppearanceCard";
import NotificationsCard from "@/components/dash/admin/settings/NotificationsCard";
import SessionsCard from "@/components/dash/admin/settings/SessionsCard";
import DangerZoneCard from "@/components/dash/admin/settings/DangerZoneCard";
import IntegrationsCard from "@/components/dash/admin/settings/IntegrationsCards";

import { apiBase, authHeaders } from "@/lib/apiHeaders";

const { Title, Text } = Typography;

export default function SettingsPage() {
  const [userId, setUserId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const API_BASE = apiBase();
        const res = await fetch(`${API_BASE}/api/auth/session/`, {
          credentials: "include",
          headers: authHeaders(), // usa Authorization: Bearer <token> se existir
        });
        if (!res.ok) throw new Error("Sessão não encontrada");
        const data = await res.json();
        const id = data?.user?.id;
        if (!id) throw new Error("Sessão não retornou user.id");
        if (!alive) return;
        setUserId(Number(id));
      } catch (e) {
        if (!alive) return;
        setErr("Não foi possível identificar o usuário logado (cookie/JWT fora de sincronia).");
      } finally {
        alive && setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Title level={3} style={{ margin: 0 }}>Settings</Title>
      <Text type="secondary">Manage your account, security, appearance, and notifications.</Text>

      {loading ? (
        <div>Carregando…</div>
      ) : err ? (
        <div style={{ color: "#b71c1c" }}>{err}</div>
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}><ProfileCard userId={userId} /></Col>
          <Col xs={24} lg={12}><SecurityCard /></Col>

          <Col xs={24} lg={12}><AppearanceCard userId={userId} /></Col>
          <Col xs={24} lg={12}><NotificationsCard userId={userId} /></Col>

          <Col xs={24} lg={12}><IntegrationsCard userId={userId} /></Col>
          <Col xs={24} lg={12}><SessionsCard userId={userId} /></Col>

          <Col span={24}><DangerZoneCard userId={userId} /></Col>
        </Row>
      )}
    </Space>
  );
}
