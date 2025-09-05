'use client';

import React from 'react';
import { Card, Row, Col, Avatar, Typography, Button } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const ICONS = {
  user: <UserOutlined />,
  team: <TeamOutlined />,
  file: <FileTextOutlined />,
  setting: <SettingOutlined />,
};

export default function QuickLinks({ items = [] }) {
  return (
    <Card title="Quick Links">
      <Row gutter={[16, 16]}>
        {items.map((q) => (
          <Col key={q.title} xs={24} sm={12} lg={6}>
            <Card
              hoverable
              styles={{
                body: {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center', // centraliza
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: 16,
                },
              }}
            >
              <Avatar
                size={48}
                style={{ backgroundColor: q.color || '#999', marginBottom: 8 }}
                icon={ICONS[q.icon] || <SettingOutlined />}
              />
              <Text strong style={{ marginBottom: 8 }}>
                {q.title}
              </Text>
              <Button type="primary" href={q.href}>
                Open
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
}
