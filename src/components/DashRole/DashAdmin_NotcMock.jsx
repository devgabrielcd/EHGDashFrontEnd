'use client';

import React from 'react';
import { Row, Col, Space, Card, Skeleton } from 'antd';

import AdminHeader from '@/components/dash/admin/AdminHeader';
import KPIGrid from '@/components/dash/admin/KPIGrid';
import RevenueChart from '@/components/dash/admin/RevenueChart';
import RecentActivity from '@/components/dash/admin/RecentActivity';
import SystemHealth from '@/components/dash/admin/SystemHealth';
import QuickLinks from '@/components/dash/admin/QuickLinks';
import TopEntities from '@/components/dash/admin/TopEntities';

import {
  useGetRevenueSeriesQuery,
  useGetAuditLogQuery,
  useGetHealthQuery,
  useGetTopEntitiesQuery,
} from '@/';

export default function DashAdmin({ user }) {
  // chama hooks
  const { data: kpis, isLoading: kpisLoading } = useGetAdminKpisQuery();
  const { data: revenue, isLoading: revLoading } = useGetRevenueSeriesQuery({ range: '12m' });
  const { data: activity, isLoading: actLoading } = useGetAuditLogQuery({ limit: 10 });
  const { data: health, isLoading: healthLoading } = useGetHealthQuery();
  const { data: top, isLoading: topLoading } = useGetTopEntitiesQuery({ by: 'revenue' });

  // links fixos (ou pode vir da API também)
  const links = [
    { title: 'Gerenciar Usuários', href: '/settings/users', icon: 'user' },
    { title: 'Times & Permissões', href: '/settings/team', icon: 'team' },
    { title: 'Relatórios', href: '/reports', icon: 'file' },
    { title: 'Configurações', href: '/settings', icon: 'setting' },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <AdminHeader user={user} />

      {kpisLoading ? (
        <Card><Skeleton active /></Card>
      ) : (
        <KPIGrid items={kpis || []} />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          {revLoading ? (
            <Card><Skeleton active paragraph={{ rows: 6 }} /></Card>
          ) : (
            <RevenueChart title="Receita (últimos 12 meses)" data={revenue} />
          )}
        </Col>
        <Col xs={24} lg={10}>
          {healthLoading ? (
            <Card><Skeleton active /></Card>
          ) : (
            <SystemHealth data={health} />
          )}
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          {actLoading ? (
            <Card><Skeleton active /></Card>
          ) : (
            <RecentActivity items={activity || []} />
          )}
        </Col>
        <Col xs={24} lg={10}>
          <QuickLinks items={links} />
        </Col>
      </Row>

      {topLoading ? (
        <Card><Skeleton active /></Card>
      ) : (
        <TopEntities items={top || []} />
      )}
    </Space>
  );
}
