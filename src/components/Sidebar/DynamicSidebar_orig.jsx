'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { useGetSidebarQuery } from '@/components/redux/services/menuApi';
import { setOpenKeys, setSelectedKey } from '@/components/redux/sidebar/selectedMenuSlice';

// Manrope for this component
import { Manrope } from 'next/font/google';
const manrope = Manrope({ subsets: ['latin'], weight: ['400','500','600','700'] });

// Icon map (minimal)
import {
  AppstoreOutlined, HomeOutlined, UserOutlined, SettingOutlined,
  BarChartOutlined, TeamOutlined, PieChartOutlined,
  DatabaseOutlined, ShoppingCartOutlined, DollarOutlined, MailOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

/** 👉 AUMENTO DE TAMANHO DE ÍCONE (sem mudar layout/padding) */
const big = (node) =>
  React.cloneElement(node, {
    style: { fontSize: 22, lineHeight: 1 }, // mude 22 -> 24 se quiser maior
  });

const iconMap = {
  home: big(<HomeOutlined />),
  dashboard: big(<AppstoreOutlined />),
  user: big(<UserOutlined />),
  settings: big(<SettingOutlined />),
  reports: big(<BarChartOutlined />),
  team: big(<TeamOutlined />),
  chart: big(<BarChartOutlined />),
  pie: big(<PieChartOutlined />),
  database: big(<DatabaseOutlined />),
  orders: big(<ShoppingCartOutlined />),
  billing: big(<DollarOutlined />),
  mail: big(<MailOutlined />),
  calendar: big(<CalendarOutlined />),
};
const getIcon = (name) => iconMap[name?.toLowerCase?.()] || big(<AppstoreOutlined />);

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

export default function DynamicSidebar({ collapsed = false }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const { data, isLoading, isError, error } = useGetSidebarQuery();
  const selectedKey = useSelector((s) => s.selectedMenu.selectedKey);
  const openKeys = useSelector((s) => s.selectedMenu.openKeys);

  const itemsRaw = data?.items || [];
  const itemsAntd = useMemo(() => toAntdItems(itemsRaw), [itemsRaw]);

  // Sync selection with current route
  useEffect(() => {
    if (!itemsRaw.length) return;
    const match = findByPath(itemsRaw, pathname);
    if (match?.key) {
      dispatch(setSelectedKey(match.key));
      dispatch(setOpenKeys(getAncestorKeys(itemsRaw, match.key)));
    }
  }, [pathname, itemsRaw, dispatch]);

  // Optional: redirect to first allowed item on /dashboard
  useEffect(() => {
    if (!itemsRaw.length) return;
    if (!pathname || pathname === '/dashboard') {
      const first = flatten(itemsRaw).find((x) => x.path);
      if (first?.path && first.path !== pathname) router.replace(first.path);
    }
  }, [pathname, itemsRaw, router]);

  const onOpenChange = (keys) => dispatch(setOpenKeys(keys));
  const onClick = (info) => dispatch(setSelectedKey(info.key));

  if (isLoading) return <div className={`${manrope.className} p-4`}>Loading menu…</div>;

  if (isError) {
    const status = error?.status ?? error?.originalStatus;
    if (status === 401 || status === 403) {
      // Se você ainda usa o LoginPrompt, reative-o aqui
      // return <LoginPrompt next={pathname || '/dashboard'} />;
    }
    return <div className={`${manrope.className} p-4 text-red-600`}>Error loading the menu.</div>;
  }

  if (!itemsRaw.length) return <div className={`${manrope.className} p-4`}>No available items.</div>;

  return (
    <div className={manrope.className} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Link
        href="/dashboard"
        aria-label="Go to dashboard"
        style={{ display: 'inline-flex', width: '100%', justifyContent: 'center' }}
      >
        <div
          style={{
            position: 'relative',
            width: collapsed ? 40 : 160,
            height: 40
          }}
        >
          <Image
            src="/images/EhgCorpLogo.png"
            alt="EHG Corp"
            fill
            sizes="(max-width: 768px) 40px, 160px"
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      </Link>

      {/* Menu */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Menu
          mode="inline"
          items={itemsAntd}
          selectedKeys={selectedKey ? [selectedKey] : []}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          onClick={onClick}
          style={{ height: '100%', borderRight: 0 }}
        />
      </div>
    </div>
  );
}
