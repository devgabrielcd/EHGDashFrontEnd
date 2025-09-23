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

const { Title, Text } = Typography;

export default function SettingsPage() {
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Title level={3} style={{ margin: 0 }}>
        Settings
      </Title>
      <Text type="secondary">
        Manage your account, security, appearance, and notifications.
      </Text>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ProfileCard />
        </Col>
        <Col xs={24} lg={12}>
          <SecurityCard />
        </Col>

        <Col xs={24} lg={12}>
          <AppearanceCard />
        </Col>
        <Col xs={24} lg={12}>
          <NotificationsCard />
        </Col>

        <Col xs={24} lg={12}>
          <IntegrationsCard />
        </Col>
        <Col xs={24} lg={12}>
          <SessionsCard />
        </Col>

        <Col span={24}>
          <DangerZoneCard />
        </Col>
      </Row>
    </Space>
  );
}
