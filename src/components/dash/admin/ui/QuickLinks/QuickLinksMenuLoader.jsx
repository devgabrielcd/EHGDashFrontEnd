'use client';

import React, { useEffect, useState } from 'react';
import QuickLinks from './QuickLinks';
import {
  HomeOutlined,
  BarChartOutlined,
  SettingOutlined,
  SoundOutlined,
  NotificationOutlined,
  HighlightOutlined,
} from '@ant-design/icons';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? 'http://localhost:8000';

// mapeia strings -> ícones do AntD
const ICON_MAP = {
  home: <HomeOutlined />,
  chart: <BarChartOutlined />,
  settings: <SettingOutlined />,
  marketing: <SoundOutlined />,
  campaign: <NotificationOutlined />,
  creative: <HighlightOutlined />,
};

const COLORS = ['#1677ff', '#fa8c16', '#52c41a', '#722ed1', '#13c2c2', '#eb2f96', '#a0d911', '#2f54eb'];
const colorForIndex = (i) => COLORS[i % COLORS.length];

function flattenMenu(items, out = []) {
  for (const it of items ?? []) {
    const { key, label, icon, path, children } = it;

    if (path) {
      out.push({
        key,
        title: label,
        href: path,
        iconKey: icon ?? 'settings',
      });
    }
    if (children && children.length) {
      flattenMenu(children, out);
    }
  }
  return out;
}

export default function QuickLinksMenuLoader({ pageSize = 8 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);

        // 1ª tentativa: com slash final (conforme você mostrou)
        let res = await fetch(`${API_BASE}/api/menu/sidebar/`, { cache: 'no-store' });
        if (!res.ok) {
          // 2ª tentativa: sem slash final (alguns routers diferenciam)
          res = await fetch(`${API_BASE}/api/menu/sidebar`, { cache: 'no-store' });
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        if (!alive) return;

        const flat = flattenMenu(json?.items ?? []);
        const mapped = flat.map((x, idx) => ({
          title: x.title,
          href: x.href,
          color: colorForIndex(idx),
          icon: x.iconKey,
          customIcon: ICON_MAP[x.iconKey] ?? <SettingOutlined />,
        }));

        setItems(mapped);
      } catch (e) {
        console.error('Erro ao carregar /api/menu/sidebar:', e);
        setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return <QuickLinks items={items} pageSize={pageSize} loading={loading} />;
}
