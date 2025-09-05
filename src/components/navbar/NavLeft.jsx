"use client";

import React from "react";
import { useTheme } from "next-themes";
import { theme } from "antd";
import { MenuOutlined } from "@ant-design/icons";

/**
 * Bloco da esquerda da navbar: botão de menu (quando collapsed) + brand
 * Props:
 *  - collapsed: boolean
 *  - onMenuClick: () => void
 *  - brand: string
 *  - iconSize?: number
 */
export default function NavLeft({
  collapsed = false,
  onMenuClick,
  brand = "Dashboard",
  iconSize = 25,
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { token } = theme.useToken();

  const iconButtonStyle = {
    background: "transparent",
    border: "none",
    color: token.colorText,
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
    <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
      {collapsed && (
        <button
          aria-label="Open menu"
          style={iconButtonStyle}
          onClick={onMenuClick}
          title="Menu"
        >
          <MenuOutlined />
        </button>
      )}

      <span
        style={{
          fontWeight: 800,
          fontSize: 25,
          letterSpacing: 0.2,
          lineHeight: 1,
          color: isDark ? token.colorText : "#555",
          whiteSpace: "nowrap",
        }}
      >
        {brand}
      </span>
    </div>
  );
}
