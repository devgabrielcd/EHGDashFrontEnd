"use client";

import { useTheme } from "next-themes";
import { theme, Tooltip, Badge, Button } from "antd";
import {
  MenuOutlined,
  BellOutlined,
  SunOutlined,
  MoonOutlined,
} from "@ant-design/icons";
import { useSidebarUI } from "@/components/sidebar/sidebarUIStore";

export default function HeaderButtons() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { token } = theme.useToken();

  const collapsed = useSidebarUI((s) => s.collapsed);
  const toggleCollapsed = useSidebarUI((s) => s.toggle); // certifique-se que existe “toggle” no store

  const iconBtn = {
    background: "transparent",
    border: "none",
    color: token.colorText,
    fontSize: 18,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    width: 40,
    borderRadius: 10,
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {/* Hambúrguer – abre/fecha sidebar */}
      <Tooltip title={collapsed ? "Open menu" : "Close menu"}>
        <button aria-label="Toggle menu" style={iconBtn} onClick={toggleCollapsed}>
          <MenuOutlined />
        </button>
      </Tooltip>

      {/* Notificações */}
      <Tooltip title="Notifications">
        <Badge count={0} size="small" offset={[-2, 6]}>
          <button aria-label="Notifications" style={iconBtn}>
            <BellOutlined />
          </button>
        </Badge>
      </Tooltip>

      {/* Tema: sol/lua */}
      <Tooltip title={isDark ? "Light Mode" : "Dark Mode"}>
        <button
          aria-label="Switch Theme"
          style={iconBtn}
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {isDark ? <SunOutlined /> : <MoonOutlined />}
        </button>
      </Tooltip>
    </div>
  );
}
