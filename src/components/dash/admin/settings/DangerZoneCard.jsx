"use client";

import React, { useMemo } from "react";
import { Card, Button, Alert, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import SectionTitle from "./SectionTitle";
import { callAPI } from "./api";
import { signOut } from "next-auth/react";

export default function DangerZoneCard() {
  const cardStyle = useMemo(
    () => ({ background: "var(--bg-panel)", borderColor: "var(--border-strong)" }),
    []
  );

  const deleteAccount = async () => {
    Modal.confirm({
      title: "Delete your account?",
      icon: <ExclamationCircleOutlined />,
      okText: "Delete",
      okButtonProps: { danger: true },
      content:
        "This action is irreversible. All your data will be permanently removed.",
      onOk: async () => {
        try {
          await callAPI("/auth/account/delete/", {});
          await signOut({ redirect: true, callbackUrl: "/" });
        } catch {
          // handled upstream
        }
      },
    });
  };

  return (
    <Card
      style={cardStyle}
      title={
        <SectionTitle icon={<ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />}>
          Danger Zone
        </SectionTitle>
      }
    >
      <Alert
        type="warning"
        message="Deleting your account is permanent."
        description="All your data will be removed. This action cannot be undone."
        showIcon
        style={{ marginBottom: 12 }}
      />
      <Button danger onClick={deleteAccount}>
        Delete account
      </Button>
    </Card>
  );
}
