'use client';

import React from 'react';
import { Space, Select } from 'antd';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * Recebe do server:
 * - company: string ("all" ou id)
 * - view: "insurance" | "planTypes" | "formTypes"
 * - companyOptions: [{label, value}]
 *
 * Altera a URL (?company=...&view=...) para forçar o server a re-renderizar com novos filtros.
 */
export default function SystemHealthFiltersClient({ company, view, companyOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pushParam = (key, value) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (value === 'all' && key === 'company') {
      params.delete('company');
    } else {
      params.set(key, value);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <Space>
      <Select
        value={company}
        style={{ width: 180 }}
        options={companyOptions}
        onChange={(val) => pushParam('company', val)}
      />
      <Select
        value={view}
        style={{ width: 190 }}
        options={[
          { label: 'Top Insurance Lines', value: 'insurance' },
          { label: 'Plan Types', value: 'planTypes' },
          { label: 'Form Types', value: 'formTypes' },
        ]}
        onChange={(val) => pushParam('view', val)}
      />
    </Space>
  );
}
