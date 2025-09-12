'use client';

import React from 'react';
import { Select } from 'antd';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function TopEntitiesFiltersClient({ value = 'all', options = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (v) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('te_company', v);     // só mexe no filtro do Top Entities
    router.push(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  return (
    <Select
      size="small"
      style={{ width: 220 }}
      options={options}
      value={value}
      onChange={onChange}
    />
  );
}
