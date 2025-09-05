"use client";

import React from "react";
import { Drawer, Avatar, Button, Divider, Menu } from "antd";
import { UserOutlined, LoginOutlined, LogoutOutlined } from "@ant-design/icons";
import { signIn, signOut } from "next-auth/react";

export default function NavMobile({
  brand,
  drawerVisible,
  onClose,
  session,           // 🔹 agora recebemos session
  avatarSrc,
  displayName,
  onNavigate,
  token,
  text,
  textSecondary,
  border,
  drawerBg,
}) {
  const isLogged = !!session; // 🔹 define se o usuário está logado

  return (
    <Drawer
      title={brand}
      placement="left"
      onClose={onClose}
      open={drawerVisible}
      styles={{
        header: {
          background: token.colorBgContainer,
          color: text,
          borderBottom: `1px solid ${border}`,
        },
        body: { background: drawerBg, padding: 0, color: text },
      }}
    >
      <div style={{ padding: 12 }}>
        {isLogged ? (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "4px 8px",
              }}
            >
              <Avatar
                size={40}
                src={avatarSrc}
                icon={!avatarSrc && <UserOutlined style={{ fontSize: 22 }} />}
              />
              <div style={{ color: text }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    letterSpacing: 0.3,
                  }}
                >
                  {displayName}
                </div>
                <div style={{ fontSize: 12, color: textSecondary }}>
                  Signed in
                </div>
              </div>
            </div>
            <Divider style={{ margin: "10px 0", borderColor: border }} />
          </>
        ) : (
          <>
            <Button
              type="primary"
              icon={<LoginOutlined style={{ fontSize: 18 }} />}
              style={{ width: "100%", marginBottom: 10 }}
              onClick={() => {
                onClose();
                signIn();
              }}
            >
              Log In
            </Button>
            <Divider style={{ margin: "10px 0", borderColor: border }} />
          </>
        )}

        <Menu
          mode="inline"
          style={{
            borderRight: "none",
            background: "transparent",
            color: text,
          }}
          items={[
            {
              key: "home",
              label: "Home",
              onClick: () => {
                onClose();
                onNavigate?.("/");
              },
            },
            {
              key: "profile",
              label: "Profile",
              onClick: () => {
                onClose();
                onNavigate?.("/profile");
              },
            },
            {
              key: "settings",
              label: "Settings",
              onClick: () => {
                onClose();
                onNavigate?.("/settings");
              },
            },
          ]}
        />

        {isLogged && (
          <>
            <Divider style={{ margin: "10px 0", borderColor: border }} />
            <Button
              danger
              block
              style={{ marginTop: 10 }}
              icon={<LogoutOutlined style={{ fontSize: 18 }} />}
              onClick={() => {
                onClose();
                signOut();
              }}
            >
              Logout
            </Button>
          </>
        )}
      </div>
    </Drawer>
  );
}
