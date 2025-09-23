// src/components/navbar/NavRight.jsx
"use client";

import React, { useRef, useState, useMemo } from "react";
import {
  Tooltip,
  Badge,
  Dropdown,
  Button,
  Avatar,
  theme,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import {
  BellOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:8000";

export default function NavRight({
  notificationsCount = 0,
  onNavigate,
  isDark,
  setTheme,
  profileMenuItems, // já vem pronto do NavbarClient (com base no isAuthenticated SSR)
  collapsed = false,

  // 🔽 novas props vindas do SERVER
  isAuthenticated = false,
  user = null,
  accessToken = null,
  displayName = "User",
  avatarSrc,

  iconSize = 25,
}) {
  const { token } = theme.useToken();
  const text = token.colorText;
  const router = useRouter();

  const [openProfile, setOpenProfile] = useState(false);
  const hoverOpenTimer = useRef(null);
  const hoverCloseTimer = useRef(null);

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const clearTimers = () => {
    if (hoverOpenTimer.current) {
      clearTimeout(hoverOpenTimer.current);
      hoverOpenTimer.current = null;
    }
    if (hoverCloseTimer.current) {
      clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
  };

  const handleEnter = () => {
    clearTimers();
    hoverOpenTimer.current = setTimeout(() => setOpenProfile(true), 80);
  };

  const handleLeave = () => {
    clearTimers();
    hoverCloseTimer.current = setTimeout(() => setOpenProfile(false), 180);
  };

  const iconBtn = {
    background: "transparent",
    border: "none",
    color: text,
    fontSize: iconSize,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 42,
    width: 42,
    borderRadius: 10,
  };

  // ---------- Edit Profile ----------
  const userId =
    user?.id ??
    user?.details?.id ??
    null;

  const initialUser = useMemo(() => {
    const d = user?.details || {};
    return {
      first_name: d.first_name ?? user?.first_name ?? "",
      last_name: d.last_name ?? user?.last_name ?? "",
      email: d.email ?? user?.email ?? "",
    };
  }, [user]);

  const openEdit = () => {
    if (!isAuthenticated) return signIn();
    form.setFieldsValue(initialUser);
    setEditOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (!userId) {
        message.error("User ID not found.");
        return;
      }
      if (!accessToken) {
        message.error("Not authenticated.");
        return;
      }
      setSaving(true);

      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
      };
      if (values.password) payload.password = values.password;

      const res = await fetch(`${API_BASE}/api/users/${userId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.detail || `HTTP ${res.status}`);
      }

      message.success("Profile updated!");
      setEditOpen(false);
      // Dica: se quiser refletir na UI sem refazer login,
      // faça um refetch do endpoint de sessão/detalhes aqui no cliente.
    } catch (err) {
      console.error(err);
      message.error(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Se o parent não mandou um menu, fazemos um fallback correto aqui:
  const defaultMenu = useMemo(() => {
    if (isAuthenticated) {
      return [
        { key: "profile", label: "My profile", onClick: () => router.push("/dashboard/profile") },
        { key: "edit", label: "Edit profile", onClick: openEdit },
        { type: "divider" },
        { key: "signout", label: "Sign out", danger: true, onClick: () => signOut({ callbackUrl: "/" }) },
      ];
    }
    return [{ key: "login", label: "Login", onClick: () => signIn() }];
  }, [isAuthenticated, router]);

  const finalMenuItems =
    profileMenuItems && profileMenuItems.length ? profileMenuItems : defaultMenu;

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 6,
        }}
      >
        {/* Notificações */}
        <Tooltip title="Notifications">
          <Badge count={notificationsCount} size="small" offset={[-2, 6]}>
            <button
              aria-label="Open Notifications"
              style={iconBtn}
              onClick={() => onNavigate?.("/notifications")}
            >
              <BellOutlined />
            </button>
          </Badge>
        </Tooltip>

        {/* Tema */}
        <Tooltip title={isDark ? "Light Mode" : "Dark Mode"}>
          <button
            aria-label="Switch Theme"
            style={iconBtn}
            onClick={() => setTheme?.(isDark ? "light" : "dark")}
          >
            {isDark ? <SunOutlined /> : <MoonOutlined />}
          </button>
        </Tooltip>

        {/* Perfil */}
        <div
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          style={{ display: "flex", alignItems: "center" }}
        >
          <Dropdown
            menu={{ items: finalMenuItems }}
            placement="bottomRight"
            open={openProfile}
            onOpenChange={(v) => setOpenProfile(v)}
            overlayStyle={{ minWidth: 200 }}
            trigger={["hover", "click"]}
          >
            <Button
              type="text"
              style={{
                color: text,
                height: 42,
                padding: "0 10px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {avatarSrc ? (
                <Avatar
                  size={32}
                  src={avatarSrc}
                  style={{
                    backgroundColor: isDark
                      ? token.colorFillSecondary
                      : "transparent",
                  }}
                />
              ) : (
                <UserOutlined style={{ fontSize: iconSize, color: text }} />
              )}
              {!collapsed && isAuthenticated && <span>{displayName}</span>}
            </Button>
          </Dropdown>
        </div>
      </div>

      {/* Modal: Edit Profile */}
      <Modal
        open={editOpen}
        title="Edit profile"
        okText="Save"
        confirmLoading={saving}
        onCancel={() => setEditOpen(false)}
        onOk={handleSave}
      >
        <Form layout="vertical" form={form} name="edit_profile_form">
          <Form.Item
            name="first_name"
            label="First name"
            rules={[{ required: true, message: "Please input your first name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Last name"
            rules={[{ required: true, message: "Please input your last name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="New password"
            tooltip="Leave blank to keep current password"
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
