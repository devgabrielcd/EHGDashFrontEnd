'use client';

import React from 'react';
import { Card, Descriptions, Space, Progress } from 'antd';
import { CloudOutlined, DatabaseOutlined, CheckCircleOutlined } from '@ant-design/icons';

export default function SystemHealth() {
  return (
    <Card title="System Health" extra={<CloudOutlined />}>
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="API">
          <Space><CheckCircleOutlined style={{ color: '#52c41a' }} /> OK</Space>
        </Descriptions.Item>
        <Descriptions.Item label="Bank">
          <Space><DatabaseOutlined style={{ color: '#52c41a' }} /> OK</Space>
        </Descriptions.Item>
        <Descriptions.Item label="Storage">
          <Space><CloudOutlined style={{ color: '#52c41a' }} /> OK</Space>
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 10 }}>
          <div style={{ marginBottom: 4 }}>CPU</div>
          <Progress percent={42} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ marginBottom: 4 }}>Memória</div>
          <Progress percent={61} />
        </div>
        <div>
          <div style={{ marginBottom: 4 }}>Disco</div>
          <Progress percent={33} />
        </div>
      </div>
    </Card>
  );
}
