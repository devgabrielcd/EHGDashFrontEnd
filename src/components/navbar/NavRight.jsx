"use client";

import React, { useRef, useState } from "react";
import { Tooltip, Badge, Dropdown, Button, Avatar, theme } from "antd";
import {
  BellOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from "@ant-design/icons";

export default function NavRight({
  notificationsCount = 0,
  onNavigate,
  isDark,
  setTheme,
  profileMenuItems,
  collapsed = false,
  session,
  displayName = "User",
  avatarSrc,
  iconSize = 25,
}) {
  const { token } = theme.useToken();
  const text = token.colorText;

  const [openProfile, setOpenProfile] = useState(false);
  const hoverOpenTimer = useRef(null);
  const hoverCloseTimer = useRef(null);

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

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6 }}>
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
          onClick={() => setTheme(isDark ? "light" : "dark")}
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
          menu={{ items: profileMenuItems }}
          placement="bottomRight"
          open={openProfile}
          onOpenChange={(v) => setOpenProfile(v)}
          overlayStyle={{ minWidth: 200 }}
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
                style={{ backgroundColor: isDark ? token.colorFillSecondary : "transparent" }}
              />
            ) : (
              <UserOutlined style={{ fontSize: iconSize, color: text }} />
            )}
            {!collapsed && session && <span>{displayName}</span>}
          </Button>
        </Dropdown>
      </div>
    </div>
  );
}
