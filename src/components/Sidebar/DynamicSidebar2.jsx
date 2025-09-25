'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { useGetSidebarQuery } from '@/components/redux/services/menuApi';
import { setOpenKeys, setSelectedKey } from '@/components/redux/sidebar/selectedMenuSlice';

// Manrope
import { Manrope } from 'next/font/google';
const manrope = Manrope({ subsets: ['latin'], weight: ['400','500','600','700'] });

// Icons
import {
  AppstoreOutlined, HomeOutlined, UserOutlined, SettingOutlined,
  BarChartOutlined, TeamOutlined, PieChartOutlined,
  DatabaseOutlined, ShoppingCartOutlined, DollarOutlined, MailOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

const RAW_ICONS = {
  home: <HomeOutlined />,
  dashboard: <AppstoreOutlined />,
  user: <UserOutlined />,
  settings: <SettingOutlined />,
  reports: <BarChartOutlined />,
  team: <TeamOutlined />,
  chart: <BarChartOutlined />,
  pie: <PieChartOutlined />,
  database: <DatabaseOutlined />,
  orders: <ShoppingCartOutlined />,
  billing: <DollarOutlined />,
  mail: <MailOutlined />,
  calendar: <CalendarOutlined />,
};

const getIcon = (name, size = 22) => {
  const base = RAW_ICONS[name?.toLowerCase?.()] || <AppstoreOutlined />;
  return React.cloneElement(base, {
    style: { ...(base.props?.style || {}), fontSize: size, lineHeight: 1 },
  });
};


function toAntdItems(items) {
  return items.map((it) => ({
    key: it.key,
    icon: getIcon(it.icon, 24), // 24px pra ficar vistoso no modo colapsado
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

function LoginPrompt({ next = '/dashboard' }) {
  return (
    <div className="p-4">
      <p>Your session has expired. Please sign in again.</p>
      <a
        href={`/login?next=${encodeURIComponent(next)}`}
        className="inline-block px-3 py-2 border rounded"
      >
        Sign in
      </a>
    </div>
  );
}

export default function DynamicSidebar({ collapsed = false, initialItems = [] }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const skipQuery = initialItems && initialItems.length > 0;
  const { data, isLoading, isError, error } = useGetSidebarQuery(undefined, {
    skip: skipQuery,
    refetchOnMountOrArgChange: false,
    refetchOnReconnect: false,
    refetchOnFocus: false,
  });

  const itemsRaw = skipQuery ? initialItems : (data?.items || []);
  const itemsAntd = useMemo(() => toAntdItems(itemsRaw), [itemsRaw]);

  useEffect(() => {
    if (!itemsRaw.length) return;
    const match = findByPath(itemsRaw, pathname);
    if (match?.key) {
      dispatch(setSelectedKey(match.key));
      dispatch(setOpenKeys(getAncestorKeys(itemsRaw, match.key)));
    }
  }, [pathname, itemsRaw, dispatch]);

  useEffect(() => {
    if (!itemsRaw.length) return;
    if (!pathname || pathname === '/dashboard') {
      const first = flatten(itemsRaw).find((x) => x.path);
      if (first?.path && first.path !== pathname) router.replace(first.path);
    }
  }, [pathname, itemsRaw, router]);

  const selectedKey = useSelector((s) => s.selectedMenu.selectedKey);
  const openKeys = useSelector((s) => s.selectedMenu.openKeys);

  const onOpenChange = (keys) => dispatch(setOpenKeys(keys));
  const onClick = (info) => dispatch(setSelectedKey(info.key));

  if (!skipQuery && isLoading) {
    return <div className={`${manrope.className} p-4`}>Loading menu…</div>;
  }

  if (!itemsRaw.length) {
    if (isError) {
      const status = error?.status ?? error?.originalStatus;
      if (status === 401 || status === 403) {
        return <LoginPrompt next={pathname || '/dashboard'} />;
      }
    }
    return <div className={`${manrope.className} p-4`}>No available items.</div>;
  }

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
          inlineCollapsed={collapsed}
          style={{ height: '100%', borderRight: 0 }}
          // theme herda do Sider; se quiser forçar:
          // theme={isDark ? 'dark' : 'light'}
        />

      </div>
    </div>
  );
}
