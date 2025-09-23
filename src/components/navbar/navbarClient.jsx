// src/components/navbar/NavbarClient.jsx
"use client";

import React, { useMemo, useState } from "react";
import { Layout, Dropdown, Avatar, Tooltip, Button, theme, Badge } from "antd";
import {
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  SettingOutlined,
  MoonOutlined,
  SunOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { signIn, signOut } from "next-auth/react";
import { Inter } from "next/font/google";
import { useTheme } from "next-themes";

import SearchBar from "@/components/navbar/SearchBar";
import NavLeft from "@/components/navbar/NavLeft";
import NavRight from "@/components/navbar/NavRight"; // ⬅️ continuará client, mas sem depender de useSession
import NavMobile from "@/components/navbar/NavMobile";

import { useSidebarUI } from "@/components/sidebar/sidebarUIStore";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const { Header } = Layout;

export default function NavbarClient({
  brand = "Dashboard",
  onNavigate,
  notificationsCount = 0,
  // vindos do server:
  isAuthenticated,
  user,
  accessToken,
  displayName,
  avatarSrc,
}) {
  const { theme: t, setTheme, resolvedTheme } = useTheme();
  const isDark = (resolvedTheme || t) === "dark";
  const { token } = theme.useToken();
  const text = token.colorText;
  const border = token.colorBorder;
  const bg = token.colorBgContainer;
  const drawerBg = token.colorBgLayout;
  const textSecondary = token.colorTextSecondary;

  const [drawerVisible, setDrawerVisible] = useState(false);
  const toggleDrawer = () => setDrawerVisible((v) => !v);
  const collapsed = useSidebarUI((s) => s.collapsed);

  // Menu do avatar calculado AQUI (no cliente) mas com base em isAuthenticated (do SERVER)
  const profileMenuItems = useMemo(() => {
    if (isAuthenticated) {
      return [
        { key: "profile", icon: <UserOutlined />, label: "Profile", onClick: () => onNavigate?.("/dashboard/profile") },
        { key: "settings", icon: <SettingOutlined />, label: "Settings", onClick: () => onNavigate?.("/settings") },
        { type: "divider" },
        { key: "logout", danger: true, icon: <LogoutOutlined />, label: "Logout", onClick: () => signOut({ callbackUrl: "/" }) },
      ];
    }
    return [{ key: "login", icon: <LoginOutlined />, label: "Login", onClick: () => signIn() }];
  }, [isAuthenticated, onNavigate]);

  const ICON_SIZE = 25;
  const rightIconBtn = {
    background: "transparent",
    border: "none",
    color: text,
    fontSize: ICON_SIZE,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 42,
    width: 42,
    borderRadius: 10,
  };

  return (
    <Header
      className={inter.variable}
      style={{
        background: bg,
        borderBottom: `1px solid ${border}`,
        display: "grid",
        gridTemplateColumns: "1fr minmax(280px, 640px) 1fr",
        alignItems: "center",
        padding: "10px 16px",
        paddingLeft: "var(--header-pl, 16px)",
        transition: "padding-left .2s ease",
        gap: 12,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <NavLeft collapsed={collapsed} onMenuClick={toggleDrawer} brand={brand} iconSize={ICON_SIZE} />

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minWidth: 0 }}>
        <SearchBar
          placeholder="Search anything…"
          maxWidth={640}
          height={38}
          onSearch={(q) => onNavigate?.(`/search?q=${encodeURIComponent(q)}`)}
        />
      </div>

      {/* Direita — agora sem useSession, só props vindas do server */}
      <NavRight
        notificationsCount={notificationsCount}
        setTheme={setTheme}
        isDark={isDark}
        rightIconBtn={rightIconBtn}
        text={text}
        textSecondary={textSecondary}
        collapsed={collapsed}
        // infos vindas do server:
        isAuthenticated={isAuthenticated}
        user={user}
        accessToken={accessToken}
        displayName={displayName}
        avatarSrc={avatarSrc}
        token={token}
        profileMenuItems={profileMenuItems}
        ICON_SIZE={ICON_SIZE}
        onNavigate={onNavigate}
      />

      <NavMobile
        brand={brand}
        drawerVisible={drawerVisible}
        onClose={toggleDrawer}
        // também refletimos o estado correto no mobile
        session={{ user, accessToken }}
        avatarSrc={avatarSrc}
        displayName={displayName}
        onNavigate={onNavigate}
        token={token}
        text={text}
        textSecondary={textSecondary}
        border={border}
        drawerBg={drawerBg}
      />

      <style jsx global>{`
        :root {
          --font-inter: ${inter.style.fontFamily};
        }
        .font-inter {
          font-family: var(--font-inter), ui-sans-serif, system-ui, -apple-system,
            Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
        }
      `}</style>
    </Header>
  );
}
