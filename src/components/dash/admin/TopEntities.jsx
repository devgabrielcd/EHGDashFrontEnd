'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Tag, Select, Space, Typography, Spin } from 'antd';
import { useSession } from 'next-auth/react';

const { Text } = Typography;
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? 'http://localhost:8000';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function TopEntities() {
  const { data: session, status } = useSession();

  const [companyOptions, setCompanyOptions] = useState([{ label: 'All', value: 'all' }]);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState('all');

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Espera o next-auth resolver a sessão
  if (status === 'loading') {
    return (
      <Card title="Latest users">
        <Spin />
      </Card>
    );
  }

  // Se não tiver sessão, evita bater no endpoint protegido
  if (!session) {
    return (
      <Card title="Latest users">
        <Text type="secondary">You must be logged in to view this data.</Text>
      </Card>
    );
  }

  // 1) Empresas (seu endpoint parece público, mas vamos mandar cookies mesmo assim)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setCompanyLoading(true);
        const res = await fetch(`${API_BASE}/company/list/`, {
          cache: 'no-store',
          credentials: 'include',
        });
        if (!res.ok) {
          console.warn('company/list/ status:', res.status);
        }
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
  }, [session]);

  // 2) URL correta dos usuários protegidos (pelo seu urls.py é /api/users/)
  const dataUrl = useMemo(() => {
    if (selectedCompany !== 'all') {
      return `${API_BASE}/api/users/?company=${encodeURIComponent(selectedCompany)}`;
    }
    return `${API_BASE}/api/users/`; // barra final OK com DRF
  }, [selectedCompany]);

  // 3) Buscar usuários (precisa estar autenticado e ser admin no backend)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErrorMsg('');
        setLoading(true);
        const res = await fetch(dataUrl, {
          cache: 'no-store',
          credentials: 'include',   // manda cookie de sessão
        });

        if (!res.ok) {
          // Log amigável pra depurar 401/403
          const bodyText = await res.text().catch(() => '');
          console.warn('GET', dataUrl, 'status:', res.status, 'body:', bodyText);
          if (res.status === 401) setErrorMsg('Unauthorized (401). Are you logged in on the backend?');
          if (res.status === 403) setErrorMsg('Forbidden (403). Your role must be admin to list users.');
          setRows([]);
          return;
        }

        const json = await res.json();
        if (!alive) return;
        setRows(Array.isArray(json) ? json : []);
      } catch (e) {
        console.error('Erro ao carregar users:', e);
        if (!alive) return;
        setErrorMsg('Failed to fetch users.');
        setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [dataUrl, session]);

  // 4) Adaptar para tabela
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
    { title: 'Phone', dataIndex: 'phone' },
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
      extra={errorMsg ? <Text type="danger">{errorMsg}</Text> : null}
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
