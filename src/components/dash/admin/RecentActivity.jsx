'use client';

import React from 'react';
import { Card, Timeline, Typography } from 'antd';

const { Text } = Typography;

export default function RecentActivity({ items = [] }) {
  return (
    <Card title="Recent Activities">
      <Timeline
        items={items.map((a) => ({
          color: a.color || 'blue',
          children: (
            <div>
              <Text strong>{a.time}</Text>
              <div>{a.text}</div>
            </div>
          ),
        }))}
      />
    </Card>
  );
}
