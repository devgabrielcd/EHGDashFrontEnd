// components/Themes/ThemeSwitch.jsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Tooltip, Button } from "antd";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";

export default function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const iconStyle = { fontSize: '25px', marginBottom: '-255px'}; // Defina o tamanho do ícone aqui

  return (
    <Tooltip title={isDark ? "Light Mode" : "Dark Mode"}>
      <Button
        type="text"
        icon={isDark ? <SunOutlined style={iconStyle} /> : <MoonOutlined style={iconStyle} />}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label="Switch Theme"
      />
    </Tooltip>
  );
}