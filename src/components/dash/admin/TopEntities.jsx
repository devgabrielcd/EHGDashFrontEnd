'use client';

import React from 'react';
import { Card, Table, Tag } from 'antd';

function TrendTag({ trend }) {
  if (trend === 'up') return <Tag color="green">↑</Tag>;
  if (trend === 'down') return <Tag color="red">↓</Tag>;
  return <Tag>→</Tag>;
}

export default function TopEntities({ items = [] }) {
  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Score', dataIndex: 'metric', align: 'right' },
    {
      title: 'Trend', dataIndex: 'trend', align: 'center',
      render: (t) => <TrendTag trend={t} />,
    },
  ];

  return (
    <Card title="Top accounts / times">
      <Table
        size="small"
        rowKey="key"
        dataSource={items}
        columns={columns}
        pagination={{ pageSize: 5, hideOnSinglePage: true }}
      />
    </Card>
  );
}
