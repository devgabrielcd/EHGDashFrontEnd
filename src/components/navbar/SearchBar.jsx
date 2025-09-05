"use client";

import React, { useMemo, useState } from "react";
import { theme } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useTheme } from "next-themes";

/**
 * Barra de busca com animação (compacta → expandida).
 *
 * Props:
 *  - placeholder?: string
 *  - onSearch?: (value: string) => void
 *  - maxWidth?: number (px)        // largura EXPANDIDA (default 640)
 *  - height?: number (px)          // altura EXPANDIDA (default 38)
 *  - compactWidth?: number (px)    // largura COMPACTA (default 320)
 *  - compactHeight?: number (px)   // altura COMPACTA (default 34)
 *  - expandOnHover?: boolean       // expande no hover (default true)
 *  - expandOnFocus?: boolean       // expande no focus (default true)
 */
export default function SearchBar({
  placeholder = "Search anything…",
  onSearch,
  maxWidth = 640,
  height = 38,
  compactWidth = 280,
  compactHeight = 34,
  expandOnHover = true,
  expandOnFocus = true,
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { token } = theme.useToken();

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  // estado final (expandida se hover ou focus estiverem ativos — conforme flags)
  const expanded = useMemo(() => {
    const byHover = expandOnHover && hovered;
    const byFocus = expandOnFocus && focused;
    return byHover || byFocus;
  }, [hovered, focused, expandOnHover, expandOnFocus]);

  const outerWidth = expanded ? maxWidth : compactWidth;
  const outerHeight = expanded ? height : compactHeight;
  const radius = Math.round(outerHeight / 2) + 3;

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearch?.(e.target.value || "");
    }
  };

  return (
    <div
      role="search"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        maxWidth: outerWidth,
        height: outerHeight,
        borderRadius: radius,
        paddingLeft: 14,
        background: isDark ? "rgba(255,255,255,0.06)" : "#f1f3f5",
        boxShadow: `inset 0 0 0 1px ${isDark ? "rgba(255,255,255,0.18)" : "#D0D5DD"}`,
        transition: "max-width 180ms ease, height 180ms ease, border-radius 180ms ease",
      }}
    >
      <input
        placeholder={placeholder}
        aria-label="Search"
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1,
          minWidth: 0,
          border: "none",
          outline: "none",
          background: "transparent",
          color: token.colorText,
          fontSize: 14,
          height: "100%",
        }}
      />
      <button
        aria-label="Search"
        onClick={(e) => {
          const input = e.currentTarget.parentElement.querySelector("input");
          onSearch?.(input?.value || "");
        }}
        style={{
          border: "none",
          outline: "none",
          cursor: "pointer",
          height: Math.max(outerHeight - 8, 26),
          width: 44,
          marginRight: 4,
          borderRadius: 16,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: isDark ? "rgba(255,255,255,0.10)" : "#E5E7EB", // “copinho”
          transition: "height 180ms ease, background 120ms ease",
        }}
      >
        <SearchOutlined
          style={{
            fontSize: 16,
            color: isDark ? "#C9CFD6" : "#616A75", // lupa cinza escuro
          }}
        />
      </button>
    </div>
  );
}
