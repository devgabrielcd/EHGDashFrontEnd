"use client";

import React, { useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  Space,
  Divider,
  Typography,
  Switch,
  Select,
  message,
  Modal,
  Tag,
  Avatar,
  Alert,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  MoonOutlined,
  SunOutlined,
  BellOutlined,
  ApiOutlined,
  LogoutOutlined,
  ExclamationCircleOutlined,
  MobileOutlined,
  GithubOutlined,
  GoogleOutlined,
} from "@ant-design/icons";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";

const { Title, Text } = Typography;

/** util placeholder para chamadas ao backend */
async function callAPI(path, payload) {
  try {
    const base = process.env.NEXT_PUBLIC_DJANGO_API_URL || "http://localhost:8000";
    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload || {}),
    });
    if (!res.ok) throw new Error("Request failed");
    return await res.json().catch(() => ({}));
  } catch (e) {
    console.error(e);
    throw e;
  }
}

function SectionTitle({ icon, children }) {
  return (
    <Space align="center" size={8} style={{ marginBottom: 8 }}>
      {icon}
      <Title level={4} style={{ margin: 0 }}>
        {children}
      </Title>
    </Space>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const user = session?.user || {};
  const details = user?.details || {};
  const firstName = details.first_name || user.first_name || user.name || "User";
  const email = details.email || user.email || "";

  // --- PROFILE --------------------------------------------------------------
  const [profileLoading, setProfileLoading] = useState(false);
  const onSaveProfile = async (values) => {
    try {
      setProfileLoading(true);
      // Ajuste a rota para o seu backend
      await callAPI("/api/profile/update/", values);
      message.success("Profile updated!");
    } catch {
      message.error("Could not update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  // --- SECURITY: PASSWORD ---------------------------------------------------
  const [pwdLoading, setPwdLoading] = useState(false);
  const onChangePassword = async (values) => {
    if (values.new_password !== values.confirm_new_password) {
      message.error("New password and confirmation do not match.");
      return;
    }
    try {
      setPwdLoading(true);
      await callAPI("/auth/password/change/", values);
      message.success("Password changed successfully!");
    } catch {
      message.error("Could not change password.");
    } finally {
      setPwdLoading(false);
    }
  };

  // --- APPEARANCE -----------------------------------------------------------
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  // --- NOTIFICATIONS --------------------------------------------------------
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifValues, setNotifValues] = useState({
    email: true,
    push: false,
    inapp: true,
    digest: "daily",
  });
  const saveNotifications = async () => {
    try {
      setNotifLoading(true);
      await callAPI("/api/notifications/prefs/", notifValues);
      message.success("Notification preferences saved!");
    } catch {
      message.error("Could not save notification preferences.");
    } finally {
      setNotifLoading(false);
    }
  };

  // --- INTEGRATIONS ---------------------------------------------------------
  const [integrations, setIntegrations] = useState([
    { key: "google", name: "Google", icon: <GoogleOutlined />, connected: false },
    { key: "github", name: "GitHub", icon: <GithubOutlined />, connected: true },
    { key: "webhooks", name: "Webhooks", icon: <ApiOutlined />, connected: false },
  ]);

  const toggleIntegration = async (key) => {
    const next = integrations.map((i) =>
      i.key === key ? { ...i, connected: !i.connected } : i
    );
    setIntegrations(next);
    message.success("Integration updated.");
    // Chame seu backend se necessário
  };

  // --- SESSIONS -------------------------------------------------------------
  const signOutAll = async () => {
    Modal.confirm({
      title: "Sign out from all devices?",
      icon: <ExclamationCircleOutlined />,
      content:
        "This will invalidate all active sessions. You’ll need to sign in again.",
      okText: "Sign out",
      okButtonProps: { danger: true, icon: <LogoutOutlined /> },
      onOk: async () => {
        try {
          await callAPI("/auth/logout/all/", {});
          await signOut({ redirect: true, callbackUrl: "/" });
        } catch {
          message.error("Could not sign out all sessions.");
        }
      },
    });
  };

  // --- DANGER ZONE ----------------------------------------------------------
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
          message.success("Account deleted.");
          await signOut({ redirect: true, callbackUrl: "/" });
        } catch {
          message.error("Could not delete account.");
        }
      },
    });
  };

  // tokens/cores básicos (segue AntD + suas vars)
  const cardStyle = useMemo(
    () => ({
      background: "var(--bg-panel)",
      borderColor: "var(--border-strong)",
    }),
    []
  );

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Title level={3} style={{ margin: 0 }}>
        Settings
      </Title>
      <Text type="secondary">
        Manage your account, security, appearance, and notifications.
      </Text>

      <Row gutter={[16, 16]}>
        {/* PROFILE */}
        <Col xs={24} lg={12}>
          <Card title={<SectionTitle icon={<UserOutlined />}>Profile</SectionTitle>} style={cardStyle}>
            <Space size={12} style={{ marginBottom: 16 }}>
              <Avatar size={56} icon={<UserOutlined />} />
              <div>
                <div style={{ fontWeight: 700 }}>{firstName}</div>
                {email ? <Text type="secondary">{email}</Text> : null}
              </div>
            </Space>

            <Form
              layout="vertical"
              onFinish={onSaveProfile}
              initialValues={{
                first_name: details.first_name || user.first_name || "",
                last_name: details.last_name || user.last_name || "",
                email: email || "",
                phone: details.phone_number || "",
              }}
            >
              <Form.Item label="First name" name="first_name">
                <Input prefix={<UserOutlined />} placeholder="First name" />
              </Form.Item>
              <Form.Item label="Last name" name="last_name">
                <Input prefix={<UserOutlined />} placeholder="Last name" />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: "email", message: "Invalid email" }]}
              >
                <Input prefix={<MailOutlined />} placeholder="name@company.com" />
              </Form.Item>
              <Form.Item label="Phone" name="phone">
                <Input prefix={<MobileOutlined />} placeholder="+1 555 123 456" />
              </Form.Item>

              <Space>
                <Button type="primary" htmlType="submit" loading={profileLoading}>
                  Save profile
                </Button>
                <Tag color="geekblue">
                  {details.user_role ? String(details.user_role).toUpperCase() : "USER"}
                </Tag>
                {details.user_type ? (
                  <Tag color="purple">{String(details.user_type).toUpperCase()}</Tag>
                ) : null}
              </Space>
            </Form>
          </Card>
        </Col>

        {/* SECURITY */}
        <Col xs={24} lg={12}>
          <Card title={<SectionTitle icon={<LockOutlined />}>Security</SectionTitle>} style={cardStyle}>
            <Alert
              type="info"
              message="Tip"
              description="Use a strong password and enable 2FA when available."
              showIcon
              style={{ marginBottom: 12 }}
            />
            <Form layout="vertical" onFinish={onChangePassword}>
              <Form.Item
                label="Current password"
                name="current_password"
                rules={[{ required: true }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Current password"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>
              <Form.Item
                label="New password"
                name="new_password"
                rules={[{ required: true, min: 6 }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="New password"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>
              <Form.Item
                label="Confirm new password"
                name="confirm_new_password"
                rules={[{ required: true, min: 6 }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirm new password"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={pwdLoading}>
                  Change password
                </Button>
                <Button disabled>Enable 2FA (soon)</Button>
              </Space>
            </Form>
          </Card>
        </Col>

        {/* APPEARANCE */}
        <Col xs={24} lg={12}>
          <Card title={<SectionTitle icon={isDark ? <MoonOutlined /> : <SunOutlined />}>Appearance</SectionTitle>} style={cardStyle}>
            <Space direction="vertical">
              <Text>Theme</Text>
              <Space>
                <Button
                  icon={<SunOutlined />}
                  type={!isDark ? "primary" : "default"}
                  onClick={() => setTheme("light")}
                >
                  Light
                </Button>
                <Button
                  icon={<MoonOutlined />}
                  type={isDark ? "primary" : "default"}
                  onClick={() => setTheme("dark")}
                >
                  Dark
                </Button>
                <Button onClick={toggleTheme}>Toggle</Button>
              </Space>
              <Text type="secondary">
                Your preference is saved per-browser using next-themes.
              </Text>
            </Space>
          </Card>
        </Col>

        {/* NOTIFICATIONS */}
        <Col xs={24} lg={12}>
          <Card title={<SectionTitle icon={<BellOutlined />}>Notifications</SectionTitle>} style={cardStyle}>
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Space style={{ justifyContent: "space-between", width: "100%" }}>
                <Text>Email alerts</Text>
                <Switch
                  checked={notifValues.email}
                  onChange={(v) => setNotifValues((s) => ({ ...s, email: v }))}
                />
              </Space>
              <Space style={{ justifyContent: "space-between", width: "100%" }}>
                <Text>Push notifications</Text>
                <Switch
                  checked={notifValues.push}
                  onChange={(v) => setNotifValues((s) => ({ ...s, push: v }))}
                />
              </Space>
              <Space style={{ justifyContent: "space-between", width: "100%" }}>
                <Text>In-app messages</Text>
                <Switch
                  checked={notifValues.inapp}
                  onChange={(v) => setNotifValues((s) => ({ ...s, inapp: v }))}
                />
              </Space>
              <Form layout="vertical" onFinish={saveNotifications}>
                <Form.Item label="Digest frequency">
                  <Select
                    value={notifValues.digest}
                    onChange={(v) => setNotifValues((s) => ({ ...s, digest: v }))}
                    options={[
                      { value: "never", label: "Never" },
                      { value: "daily", label: "Daily" },
                      { value: "weekly", label: "Weekly" },
                    ]}
                  />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={notifLoading}>
                  Save notifications
                </Button>
              </Form>
            </Space>
          </Card>
        </Col>

        {/* INTEGRATIONS */}
        <Col xs={24} lg={12}>
          <Card title={<SectionTitle icon={<ApiOutlined />}>Integrations</SectionTitle>} style={cardStyle}>
            <Space direction="vertical" style={{ width: "100%" }}>
              {integrations.map((it) => (
                <Card
                  key={it.key}
                  size="small"
                  style={{ background: "transparent", borderColor: "var(--border-strong)" }}
                >
                  <Space style={{ width: "100%", justifyContent: "space-between" }}>
                    <Space>
                      {it.icon}
                      <Text>{it.name}</Text>
                      {it.connected ? <Tag color="green">Connected</Tag> : <Tag>Disconnected</Tag>}
                    </Space>
                    <Button onClick={() => toggleIntegration(it.key)}>
                      {it.connected ? "Disconnect" : "Connect"}
                    </Button>
                  </Space>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>

        {/* SESSIONS */}
        <Col xs={24} lg={12}>
          <Card title={<SectionTitle icon={<LogoutOutlined />}>Sessions</SectionTitle>} style={cardStyle}>
            <Space direction="vertical">
              <Text type="secondary">
                You are signed in as <b>{email || firstName}</b>.
              </Text>
              <Button danger icon={<LogoutOutlined />} onClick={signOutAll}>
                Sign out from all devices
              </Button>
            </Space>
          </Card>
        </Col>

        {/* DANGER ZONE */}
        <Col span={24}>
          <Card
            style={{
              ...cardStyle,
              borderColor: "var(--border-strong)",
            }}
            title={<SectionTitle icon={<ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />}>Danger Zone</SectionTitle>}
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
        </Col>
      </Row>
    </Space>
  );
}
