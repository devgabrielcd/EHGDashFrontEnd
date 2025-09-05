"use client";
import { Card, Avatar, Tag, Space, Typography } from "antd";
const { Text } = Typography;

export default function ProfileCard({ employee }) {
  return (
    <Card title="My Profile">
      <Space align="start" size={16}>
        <Avatar size={64} src={employee?.avatarUrl}>
          {employee?.name?.[0]}
        </Avatar>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{employee?.name}</div>
          <Text type="secondary">{employee?.roleTitle}</Text>
          <div style={{ marginTop: 8 }}>
            <Tag>{employee?.department}</Tag>
            <Tag color="blue">{employee?.location}</Tag>
          </div>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">Manager: </Text>
            <Text>{employee?.manager}</Text>
          </div>
        </div>
      </Space>
    </Card>
  );
}
