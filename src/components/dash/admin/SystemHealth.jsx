'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, Space, Progress, Select, Divider, Empty } from 'antd';
import { CloudOutlined } from '@ant-design/icons';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? 'http://localhost:8000';

const VIEW_OPTIONS = [
  { label: 'Top Insurance Lines', value: 'insurance' },
  { label: 'Plan Types', value: 'planTypes' },
  { label: 'Form Types', value: 'formTypes' },
];

function percent(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}
function counterMap(rows, field) {
  const map = new Map();
  for (const r of rows) {
    const key = r?.[field] ?? 'Unknown';
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}
function toSortedArray(map) {
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export default function SystemHealth() {
  const [companyOptions, setCompanyOptions] = useState([{ label: 'All', value: 'all' }]);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState('all');

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState('insurance'); // insurance | planTypes | formTypes
  const palette = ['#1677ff', '#52c41a', '#fa8c16', '#722ed1', '#13c2c2', '#eb2f96', '#a0d911'];

  // Empresas
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setCompanyLoading(true);
        const res = await fetch(`${API_BASE}/company/list/`, { cache: 'no-store' });
        const json = res.ok ? await res.json() : [];
        if (!alive) return;
        const opts = Array.isArray(json)
          ? json.filter((c) => c?.id && c?.name).map((c) => ({ label: c.name, value: String(c.id) }))
          : [];
        setCompanyOptions([{ label: 'All', value: 'all' }, ...opts]);
      } catch {
        setCompanyOptions([{ label: 'All', value: 'all' }]);
      } finally {
        if (alive) setCompanyLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Dados
  const dataUrl = useMemo(() => {
    if (selectedCompany !== 'all') {
      return `${API_BASE}/sheets/sheet-data/?company=${encodeURIComponent(selectedCompany)}`;
    }
    return `${API_BASE}/sheets/sheet-data/`;
  }, [selectedCompany]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(dataUrl, { cache: 'no-store' });
        const json = res.ok ? await res.json() : [];
        if (!alive) return;
        setRows(Array.isArray(json) ? json : []);
      } catch {
        if (!alive) return;
        setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [dataUrl]);

  // Agregações
  const { total, byInsurance, byCoverageType, byFormType } = useMemo(() => {
    const total = rows.length;
    const byInsurance = toSortedArray(counterMap(rows, 'insuranceCoverage'));
    const byCoverageType = toSortedArray(counterMap(rows, 'coverageType'));
    const byFormType = toSortedArray(counterMap(rows, 'formType'));
    return { total, byInsurance, byCoverageType, byFormType };
  }, [rows]);

  const section = useMemo(() => {
    switch (viewMode) {
      case 'planTypes': return { title: 'Plan Types', data: byCoverageType };
      case 'formTypes': return { title: 'Form Types', data: byFormType };
      case 'insurance':
      default: return { title: 'Top Insurance Lines', data: byInsurance };
    }
  }, [viewMode, byInsurance, byCoverageType, byFormType]);

  return (
    <Card
      title="Product Mix"
      extra={
        <Space>
          <Select
            value={selectedCompany}
            onChange={setSelectedCompany}
            options={companyOptions}
            loading={companyLoading}
            style={{ width: 180 }}
          />
          <Select
            value={viewMode}
            onChange={setViewMode}
            options={VIEW_OPTIONS}
            style={{ width: 190 }}
          />
          <CloudOutlined />
        </Space>
      }
    >
      <Divider style={{ marginTop: 0, marginBottom: 12 }}>{section.title}</Divider>

      {/* Área compacta com scroll interno (reduzida) */}
      <div style={{ maxHeight: 240, overflowY: 'auto', paddingRight: 8 }}>
        {loading ? (
          <div style={{ padding: 8 }}>Carregando...</div>
        ) : section.data.length ? (
          <Space direction="vertical" style={{ width: '100%' }}>
            {section.data.map((item, idx) => (
              <div key={`${viewMode}-${item.name}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{item.name}</span>
                  <span>
                    {item.count} ({percent(item.count, total)}%)
                  </span>
                </div>
                <Progress
                  percent={percent(item.count, total)}
                  showInfo={false}
                  strokeColor={palette[idx % palette.length]}
                />
              </div>
            ))}
          </Space>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sem dados" />
        )}
      </div>
    </Card>
  );
}
