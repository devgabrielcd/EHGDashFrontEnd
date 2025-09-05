'use client';

import React from 'react';
import { Card, Space, Typography, Tag } from 'antd';

const { Title, Text } = Typography;

export default function AdminHeader({ user }) {
  const fullName = [user?.first_name, user?.middle_name, user?.last_name].filter(Boolean).join(' ') || user?.user;
    console.log("AdminHeaderLoogg",fullName);
  
  return (
    <Card>
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <Title level={3} style={{ margin: 0 }}>Welcome, {fullName || 'Admin'}</Title>
        <Space wrap>
          {user?.user_type ? <Tag color="geekblue">{String(user.user_type).toUpperCase()}</Tag> : null}
          {user?.user_role ? <Tag color="purple">{String(user.user_role).toUpperCase()}</Tag> : null}
          {user?.email ? <Text type="secondary">Email: {user.email}</Text> : null}
          {user?.phone_number ? <Text type="secondary">Phone: {user.phone_number}</Text> : null}
        </Space>
      </Space>
    </Card>
  );
}
