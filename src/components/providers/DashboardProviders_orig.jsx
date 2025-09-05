"use client";

import React from "react";
import "@ant-design/v5-patch-for-react-19";
import "antd/dist/reset.css";
import { ConfigProvider, theme as antdTheme, Spin } from "antd";
import { ThemeProvider, useTheme } from "next-themes";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/components/redux/store";

/**
 * Esconde o app até a hidratação terminar → evita FOUC.
 */
function HydrationGate({ children }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Tela de loading com o mesmo BG do layout
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "var(--bg-layout, #0b0d11)",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }
  return children;
}

/**
 * Aplica tokens do AntD e CSS vars por tema.
 */
function ThemedShell({ children }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const ui = React.useMemo(
    () => ({
      bgLayout: isDark ? "#0b0d11" : "#edf0f5",
      bgPanel:  isDark ? "#0f1115" : "#ffffff",
      border:   isDark ? "#1f2937" : "#c0c4cc",
    }),
    [isDark]
  );

  const antdConfig = React.useMemo(
    () => ({
      algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: {
        colorBgLayout: ui.bgLayout,
      },
    }),
    [isDark, ui.bgLayout]
  );

  return (
    <ConfigProvider theme={antdConfig}>
      {/* CSS vars globais para manter consistência com o server */}
      <style jsx global>{`
        :root {
          --bg-layout: ${ui.bgLayout};
          --bg-panel: ${ui.bgPanel};
          --border-strong: ${ui.border};
        }
      `}</style>
      {children}
    </ConfigProvider>
  );
}

export default function DashboardProviders({ children }) {
  return (
      <ReduxProvider store={store}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <HydrationGate>
            <ThemedShell>{children}</ThemedShell>
          </HydrationGate>
        </ThemeProvider>
      </ReduxProvider>
  );
}
