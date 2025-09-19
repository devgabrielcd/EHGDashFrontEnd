'use client';

import React, { useMemo } from 'react';
import { Table, Tag } from 'antd';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

export default function TopEntitiesClient({ rows }) {
  const dataSource = useMemo(() => {
    const sorted = [...(rows ?? [])].sort((a, b) => {
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
      user_role: r.user_role ?? '—',
      user_type: r.user_type ?? '—',
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
    { title: 'User Role', dataIndex: 'user_role', render: (v) => <Tag color="geekblue">{v}</Tag> },
    { title: 'User Type', dataIndex: 'user_type', render: (v) => <Tag color="purple">{v}</Tag> },
    { title: 'Plan Type', dataIndex: 'insuranceCoverage', render: (v) => <Tag>{v}</Tag> },
    { title: 'Coverage', dataIndex: 'coverageType', render: (v) => <Tag color="blue">{v}</Tag> },
    { title: 'Company', dataIndex: 'company' },
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
    <Table
      size="small"
      rowKey="key"
      dataSource={dataSource}
      columns={columns}
      pagination={{ pageSize: 8, showSizeChanger: false }}
    />
  );
}
