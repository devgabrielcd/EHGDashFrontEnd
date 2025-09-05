// src/components/navbar/Navbar.jsx
"use client";

import React, { useMemo, useState } from "react";
import { Layout, Dropdown, Avatar, Badge, Tooltip, Button, theme } from "antd";
import {
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  SettingOutlined,
  MoonOutlined,
  SunOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { signIn, signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Inter } from "next/font/google"; // 👈 Alterado aqui

import SearchBar from "@/components/navbar/SearchBar";
import NavLeft from "@/components/navbar/NavLeft";
import NavRight from "@/components/navbar/NavRight";
import NavMobile from "@/components/navbar/NavMobile";

import { useSidebarUI } from "@/components/sidebar/sidebarUIStore";

const inter = Inter({ // 👈 Alterado aqui
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const { Header } = Layout;

function getDisplayName(session) {
  const u = session?.user;
  return (
    u?.name ||
    u?.first_name ||
    u?.details?.name ||
    u?.details?.first_name ||
    (u?.email ? u.email.split("@")[0] : null) ||
    "User"
  );
}
function getAvatar(session) {
  const u = session?.user;
  return u?.image || u?.avatar || u?.details?.avatar || undefined;
}

export default function Navbar({
  collapsed: _ignoredCollapsed,
  setCollapsed: _ignoredSetter,
  brand = "Dashboard",
  onNavigate,
  notificationsCount = 0,
}) {
  const { data: session } = useSession();

  const { theme: t, setTheme, resolvedTheme } = useTheme();
  const isDark = (resolvedTheme || t) === "dark";

  const { token } = theme.useToken();
  const bg = token.colorBgContainer;
  const text = token.colorText;
  const textSecondary = token.colorTextSecondary;
  const border = token.colorBorder;
  const drawerBg = token.colorBgLayout;

  const [drawerVisible, setDrawerVisible] = useState(false);
  const toggleDrawer = () => setDrawerVisible((v) => !v);

  const displayName = getDisplayName(session);
  const avatarSrc = getAvatar(session);

  const collapsed = useSidebarUI((s) => s.collapsed);

  const profileMenuItems = useMemo(() => {
    if (session) {
      return [
        { key: "profile", icon: <UserOutlined />, label: "Profile", onClick: () => onNavigate?.("/profile") },
        { key: "settings", icon: <SettingOutlined />, label: "Settings", onClick: () => onNavigate?.("/settings") },
        { type: "divider" },
        { key: "logout", danger: true, icon: <LogoutOutlined />, label: "Logout", onClick: () => signOut() },
      ];
    }
    return [{ key: "login", icon: <LoginOutlined />, label: "Login", onClick: () => signIn() }];
  }, [session, onNavigate]);

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
      className={inter.variable} // 👈 Alterado aqui
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

      <NavRight
        session={session}
        notificationsCount={notificationsCount}
        setTheme={setTheme}
        isDark={isDark}
        rightIconBtn={rightIconBtn}
        text={text}
        textSecondary={textSecondary}
        collapsed={collapsed}
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
        session={session}
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
          --font-inter: ${inter.style.fontFamily}; // 👈 Alterado aqui
        }
        .font-inter {
          font-family: var(--font-inter), ui-sans-serif, system-ui, -apple-system,
            Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
        }
      `}</style>
    </Header>
  );
}