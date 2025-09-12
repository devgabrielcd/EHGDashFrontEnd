"use client";
import { Card, List, Typography } from "antd";
const { Text } = Typography;

export default function AnnouncementsCard({ items = [] }) {
  return (
    <Card title="Announcements">
      <List
        dataSource={items}
        renderItem={(it) => (
          <List.Item key={it.id}>
            <div style={{ width: "100%" }}>
              <div style={{ fontWeight: 600 }}>{it.title}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {it.date}
              </Text>
              <div style={{ marginTop: 4 }}>{it.summary}</div>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
}
