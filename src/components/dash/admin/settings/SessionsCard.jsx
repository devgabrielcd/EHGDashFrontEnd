"use client";

import React, { useMemo } from "react";
import { Card, Space, Typography, Button, Modal } from "antd";
import { LogoutOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import SectionTitle from "./SectionTitle";
import { useSession, signOut } from "next-auth/react";
import { callAPI } from "./api";

const { Text } = Typography;

export default function SessionsCard() {
  const { data: session } = useSession();
  const email =
    session?.user?.details?.email || session?.user?.email || "your account";

  const cardStyle = useMemo(
    () => ({ background: "var(--bg-panel)", borderColor: "var(--border-strong)" }),
    []
  );

  const signOutAll = async () => {
    Modal.confirm({
      title: "Sign out from all devices?",
      icon: <ExclamationCircleOutlined />,
      content: "This will invalidate all active sessions.",
      okText: "Sign out",
      okButtonProps: { danger: true, icon: <LogoutOutlined /> },
      onOk: async () => {
        try {
          await callAPI("/auth/logout/all/", {});
          await signOut({ redirect: true, callbackUrl: "/" });
        } catch {
          // handled by API in real usage
        }
      },
    });
  };

  return (
    <Card title={<SectionTitle icon={<LogoutOutlined />}>Sessions</SectionTitle>} style={cardStyle}>
      <Space direction="vertical">
        <Text type="secondary">You are signed in as <b>{email}</b>.</Text>
        <Button danger icon={<LogoutOutlined />} onClick={signOutAll}>
          Sign out from all devices
        </Button>
      </Space>
    </Card>
  );
}
