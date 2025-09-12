'use client';

import React, { useMemo } from 'react';
import { Table, Tag, Tooltip } from 'antd';

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

const PLAN_ALLOW = new Set([
  'health', 'life', 'dental', 'vision', 'medicare', 'accident', 'hospital', 'critical illness',
]);

const PLAN_TYPE_ALLOW = new Set(['individual', 'family', 'group', 'employer', 'other']);

const ROLE_LIKE = new Set(['admin', 'employee', 'staff', 'customer', 'owner', 'manager', '-']);

function cleanStr(v) {
  if (!v) return '';
  return String(v).trim();
}
function toTitle(s) {
  if (!s) return '';
  return s
    .split(' ')
    .filter(Boolean)
    .map(w => w[0]?.toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Agora NÃO exige user_type === 'customer'.
 * Mostra para qualquer usuário desde que o valor não pareça papel/cargo.
 */
function normalizePlan(_userType, planRaw) {
  const raw = cleanStr(planRaw).toLowerCase();
  if (!raw) return '—';

  if (ROLE_LIKE.has(raw)) return '—';
  if (PLAN_ALLOW.has(raw)) return toTitle(raw);

  // heurísticas leves para valores comuns
  if (raw.startsWith('medic')) return 'Medicare';
  if (raw.startsWith('health')) return 'Health';
  if (raw.startsWith('life')) return 'Life';
  if (raw.startsWith('dental')) return 'Dental';
  if (raw.startsWith('vision')) return 'Vision';

  return '—';
}

function normalizePlanType(_userType, typeRaw) {
  const raw = cleanStr(typeRaw).toLowerCase();
  if (!raw) return '—';

  if (ROLE_LIKE.has(raw)) return '—';
  if (PLAN_TYPE_ALLOW.has(raw)) return toTitle(raw);

  // correções comuns
  if (raw.includes('indiv')) return 'Individual';
  if (raw.includes('fam')) return 'Family';
  if (raw.includes('group') || raw.includes('employer')) return 'Group';

  return '—';
}

export default function TopEntitiesClient({ rows }) {
  const dataSource = useMemo(() => {
    const sorted = [...(rows ?? [])].sort((a, b) => {
      const da = new Date(a?.datetime ?? 0).getTime();
      const db = new Date(b?.datetime ?? 0).getTime();
      return db - da;
    });

    return sorted.map((r) => {
      const user_role = r?.user_role ?? '—';
      const user_type = r?.user_type ?? '—';

      const insuranceCoverage = normalizePlan(user_type, r?.insuranceCoverage);
      const coverageType = normalizePlanType(user_type, r?.coverageType);

      return {
        key: r.id ?? `${r.email}-${r.datetime}`,
        firstName: r.firstName ?? r.firstname ?? '',
        lastName: r.lastName ?? r.lastname ?? '',
        email: r.email ?? '—',
        phone: r.phone ?? '—',
        user_role,
        user_type,
        insuranceCoverage,
        coverageType,
        company: r.company_name ?? r.company ?? '—',
        datetime: r.datetime ?? null,
      };
    });
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
    {
      title: 'Coverage',
      dataIndex: 'insuranceCoverage',
      render: (v) =>
        v === '—' ? '—' : (
          <Tooltip title="Sanitized value">
            <Tag>{v}</Tag>
          </Tooltip>
        ),
    },
    {
      title: 'Plan Type',
      dataIndex: 'coverageType',
      render: (v) =>
        v === '—' ? '—' : (
          <Tooltip title="Sanitized value">
            <Tag color="blue">{v}</Tag>
          </Tooltip>
        ),
    },
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
