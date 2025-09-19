"use client";

import React from "react";
import { Space, Select } from "antd";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function setQuery(searchParams, key, value) {
  const sp = new URLSearchParams(searchParams.toString());
  if (value === undefined || value === null || value === "") {
    sp.delete(key);
  } else {
    sp.set(key, String(value));
  }
  return sp;
}

/**
 * Filtros clicáveis pro SystemHealth (atualiza a URL)
 * Props:
 * - companyOptions: [{label, value}]
 * - company: string ("all" ou id)
 * - view: "insurance" | "planTypes" | "formTypes"
 * - companyKey: nome do query param para empresa (default: "company")
 * - viewKey: nome do query param para o tipo de visão (default: "view")
 */
export default function SystemHealthFilters({
  companyOptions,
  company = "all",
  view = "insurance",
  companyKey = "company",
  viewKey = "view",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChangeCompany = (val) => {
    const sp = setQuery(searchParams, companyKey, val);
    // mantém os outros parâmetros já existentes
    router.push(`${pathname}?${sp.toString()}`);
  };

  const onChangeView = (val) => {
    const sp = setQuery(searchParams, viewKey, val);
    router.push(`${pathname}?${sp.toString()}`);
  };

  return (
    <Space>
      <Select
        value={company}
        onChange={onChangeCompany}
        options={companyOptions}
        style={{ width: 180 }}
      />
      <Select
        value={view}
        onChange={onChangeView}
        options={[
          { label: "Top Insurance Lines", value: "insurance" },
          { label: "Plan Types", value: "planTypes" },
          { label: "Form Types", value: "formTypes" },
        ]}
        style={{ width: 190 }}
      />
    </Space>
  );
}
