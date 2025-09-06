'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Tag, Select, Space } from 'antd';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? 'http://localhost:8000';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function TopEntities() {
  const [companyOptions, setCompanyOptions] = useState([{ label: 'All', value: 'all' }]);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState('all');

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1) Carregar empresas
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
      } catch (e) {
        console.error('Erro ao carregar empresas:', e);
        setCompanyOptions([{ label: 'All', value: 'all' }]);
      } finally {
        if (alive) setCompanyLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // 2) Buscar usuários
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
      } catch (e) {
        console.error('Erro ao carregar sheet-data:', e);
        if (!alive) return;
        setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [dataUrl]);

  // 3) Adaptar para tabela
  const dataSource = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
      const da = new Date(a?.datetime ?? 0).getTime();
      const db = new Date(b?.datetime ?? 0).getTime();
      return db - da;
    });
    return sorted.map((r) => ({
      key: r.id ?? `${r.email}-${r.datetime}`,
      firstName: r.firstName ?? r.firstname ?? '',
      lastName: r.lastName ?? r.lastname ?? '',
      email: r.email ?? '—',
      phone: r.phone ?? '—',
      insuranceCoverage: r.insuranceCoverage ?? '—',
      coverageType: r.coverageType ?? '—',
      company: r.company_name ?? r.company ?? '—',
      datetime: r.datetime ?? null,
    }));
  }, [rows]);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'firstName',
      render: (_v, record) => `${record.firstName || ''} ${record.lastName || ''}`.trim() || '—',
    },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Phone', dataIndex: 'phone' }, // 👈 novo campo
    {
      title: 'Plan',
      dataIndex: 'insuranceCoverage',
      render: (v) => <Tag>{v}</Tag>,
      responsive: ['md'],
    },
    {
      title: 'Type',
      dataIndex: 'coverageType',
      render: (v) => <Tag color="blue">{v}</Tag>,
      responsive: ['lg'],
    },
    { title: 'Company', dataIndex: 'company', responsive: ['md'] },
    {
      title: 'Date',
      dataIndex: 'datetime',
      render: (v) => formatDate(v),
      align: 'right',
      sorter: (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
      defaultSortOrder: 'descend',
    },
  ];

  return (
    <Card
      title={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <span>Latest users</span>
          <Select
            value={selectedCompany}
            onChange={setSelectedCompany}
            options={companyOptions}
            loading={companyLoading}
            style={{ width: 220 }}
          />
        </Space>
      }
    >
      <Table
        size="small"
        rowKey="key"
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 8, showSizeChanger: false }}
      />
    </Card>
  );
}
