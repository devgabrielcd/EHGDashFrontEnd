'use client';

import React, { useMemo } from 'react';
import { Select, Space } from 'antd';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const PERIOD_OPTIONS = [
  { label: 'Last 3 months', value: 3 },
  { label: 'Last 6 months', value: 6 },
  { label: 'Last 9 months', value: 9 },
  { label: 'Last 12 months', value: 12 },
];

export default function RevenueChartFiltersClient({ period = 12, company = "all", companyOptions = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const periodValue = useMemo(() => {
    const raw = Number(searchParams.get('rev_period'));
    return Number.isFinite(raw) ? raw : period;
  }, [searchParams, period]);

  const companyValue = useMemo(() => {
    return searchParams.get('rev_company') || company;
  }, [searchParams, company]);

  const updateParam = (key, value) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set(key, String(value));
    router.push(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  return (
    <Space>
      <Select
        size="small"
        style={{ width: 160 }}
        value={periodValue}
        onChange={(v) => updateParam('rev_period', v)}
        options={PERIOD_OPTIONS}
      />
      <Select
        size="small"
        style={{ width: 180 }}
        value={companyValue}
        onChange={(v) => updateParam('rev_company', v)}
        options={companyOptions}
      />
    </Space>
  );
}
