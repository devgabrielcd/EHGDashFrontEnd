// src/components/Sidebar/SiderClient.jsx
"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { Layout, Menu, Skeleton } from "antd";
import Link from "next/link";
import Image from "next/image";
import {
  AppstoreOutlined, HomeOutlined, UserOutlined, SettingOutlined,
  BarChartOutlined, TeamOutlined, PieChartOutlined, DatabaseOutlined,
  ShoppingCartOutlined, DollarOutlined, MailOutlined, CalendarOutlined,
  SoundOutlined, RocketOutlined, MessageOutlined,
  PictureOutlined, FacebookOutlined
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useTheme } from "next-themes";                 // 👈 tema atual

import { setOpenKeys, setSelectedKey } from "@/components/redux/sidebar/selectedMenuSlice";
import { useGetSidebarQuery } from "@/components/redux/services/menuApi";
import { useSidebarUI } from "@/components/sidebar/sidebarUIStore";

const { Sider } = Layout;

// ícones maiores
const ICON_STYLE = { fontSize: 25 };
const iconMap = {
  home: <HomeOutlined style={ICON_STYLE} />,
  dashboard: <AppstoreOutlined style={ICON_STYLE} />,
  user: <UserOutlined style={ICON_STYLE} />,
  settings: <SettingOutlined style={ICON_STYLE} />,
  reports: <BarChartOutlined style={ICON_STYLE} />,
  team: <TeamOutlined style={ICON_STYLE} />,
  chart: <BarChartOutlined style={ICON_STYLE} />,
  pie: <PieChartOutlined style={ICON_STYLE} />,
  database: <DatabaseOutlined style={ICON_STYLE} />,
  orders: <ShoppingCartOutlined style={ICON_STYLE} />,
  billing: <DollarOutlined style={ICON_STYLE} />,
  mail: <MailOutlined style={ICON_STYLE} />,
  calendar: <CalendarOutlined style={ICON_STYLE} />,
  marketing: <SoundOutlined style={ICON_STYLE} />,       // seção Marketing
  campaign: <RocketOutlined style={ICON_STYLE} />,       // Campaign Agent
  creative: <PictureOutlined style={ICON_STYLE} />,      // Creative Agent
  facebook: <FacebookOutlined style={ICON_STYLE} />,     // se não existir, troque por RocketOutlined
  instagram: <PictureOutlined style={ICON_STYLE} />,     // placeholder
  whatsapp: <MessageOutlined style={ICON_STYLE} />,      // WhatsApp
  image: <PictureOutlined style={ICON_STYLE} />,         // Flyers
};
const getIcon = (name) => iconMap[name?.toLowerCase?.()] || <AppstoreOutlined style={ICON_STYLE} />;

function toAntdItems(items) {
  return items.map((it) => ({
    key: it.key,
    icon: getIcon(it.icon),
    label: it.path ? <Link href={it.path}>{it.label}</Link> : it.label,
    children: it.children?.length ? toAntdItems(it.children) : undefined,
  }));
}
function flatten(items, parentKey) {
  const out = [];
  for (const it of items) {
    out.push({ ...it, parentKey });
    if (it.children?.length) out.push(...flatten(it.children, it.key));
  }
  return out;
}
const findByPath = (items, path) => flatten(items).find((x) => x.path === path);
function getAncestorKeys(items, key) {
  if (!key) return [];
  const flat = flatten(items);
  const byKey = new Map(flat.map((x) => [x.key, x]));
  const ancestors = [];
  let cur = byKey.get(key);
  while (cur?.parentKey) {
    ancestors.push(cur.parentKey);
    cur = byKey.get(cur.parentKey);
  }
  return ancestors;
}

export default function SiderClient({ initialItems = [] }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const collapsed = useSidebarUI((s) => s.collapsed);
  const setCollapsed = useSidebarUI((s) => s.setCollapsed);

  const hoverOpen = useRef(null);
  const hoverClose = useRef(null);

  // 👇 tema atual
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Decide qual logo usar
  const logoSrc = useMemo(() => {
    if (collapsed) {
      return isDark
        ? "/images/ehgcollapseddark.png"
        : "/images/ehgcollapsedlight.png";
    }
    return isDark ? "/images/ehglogodark.png" : "/images/ehglogolight.png";
  }, [collapsed, isDark]);

  const skipQuery = initialItems && initialItems.length > 0;
  const { data, isLoading } = useGetSidebarQuery(undefined, {
    skip: skipQuery,
    refetchOnMountOrArgChange: false,
    refetchOnReconnect: false,
    refetchOnFocus: false,
  });
  const itemsRaw = skipQuery ? initialItems : (data?.items || []);
  const itemsAntd = useMemo(() => toAntdItems(itemsRaw), [itemsRaw]);

  // seleciona pelo path
  useEffect(() => {
    if (!itemsRaw.length) return;
    const match = findByPath(itemsRaw, pathname);
    if (match?.key) {
      dispatch(setSelectedKey(match.key));
      dispatch(setOpenKeys(getAncestorKeys(itemsRaw, match.key)));
    }
  }, [pathname, itemsRaw, dispatch]);

  // redirect se /dashboard
  useEffect(() => {
    if (!itemsRaw.length) return;
    if (!pathname || pathname === "/dashboard") {
      const first = flatten(itemsRaw).find((x) => x.path);
      if (first?.path && first.path !== pathname) router.replace(first.path);
    }
  }, [pathname, itemsRaw, router]);

  // CSS var da largura
  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-w", collapsed ? "80px" : "240px");
  }, [collapsed]);

  // hover open/close
  const handleMouseEnter = () => {
    if (hoverClose.current) { clearTimeout(hoverClose.current); hoverClose.current = null; }
    hoverOpen.current = setTimeout(() => setCollapsed(false), 80);
  };
  const handleMouseLeave = () => {
    if (hoverOpen.current) { clearTimeout(hoverOpen.current); hoverOpen.current = null; }
    hoverClose.current = setTimeout(() => setCollapsed(true), 200);
  };

  // skeleton inicial (sem SSR)
  if (!skipQuery && isLoading && !itemsRaw.length) {
    return (
      <Sider
        width={200}
        collapsedWidth={80}
        collapsed={true}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 200,
          background: "var(--bg-panel)",
          borderRight: "1px solid var(--border-strong)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: 16 }}>
          <Skeleton active />
        </div>
      </Sider>
    );
  }

  return (
    <Sider
      width={240}
      collapsedWidth={85}
      collapsed={collapsed}
      trigger={null}
      theme="light"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        zIndex: 200,
        background: "var(--bg-panel)",
        borderRight: "1px solid var(--border-strong)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTransitionEnd={() => {
        document.documentElement.style.setProperty("--sidebar-w", collapsed ? "80px" : "240px");
      }}
    >
      {/* Logo – troca por tema/estado e ocupa a largura ideal */}
      <div style={{ display: "flex", justifyContent: "center", padding: 8 }}>
        <div
          style={{
            position: "relative",
            width: collapsed ? 56 : 200, // um pouco maior p/ logos widescreen
            height: collapsed ? 40 : 48,
            transition: "width .2s ease, height .2s ease",
          }}
        >
          <Image
            src={logoSrc}
            alt="EHGCorp"
            fill
            sizes="(max-width: 768px) 56px, 200px"
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      </div>

      {/* Menu coladinho no logo */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Menu
          mode="inline"
          items={itemsAntd}
          style={{
            flex: 1,
            borderRight: 0,
            background: "transparent",
            paddingTop: 0,
            marginTop: -6,
          }}
          inlineCollapsed={collapsed}
          onOpenChange={(keys) => dispatch(setOpenKeys(keys))}
          onClick={(info) => dispatch(setSelectedKey(info.key))}
        />
      </div>
    </Sider>
  );
}
