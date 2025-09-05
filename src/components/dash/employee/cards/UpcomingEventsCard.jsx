"use client";
import { Card, List, Typography } from "antd";
const { Text } = Typography;

export default function UpcomingEventsCard({ items = [] }) {
  return (
    <Card title="Upcoming Events">
    <List
        dataSource={items}
        renderItem={(e) => (
          <List.Item key={e.id}>
            <div style={{ width: "100%" }}>
              <div style={{ fontWeight: 600 }}>{e.title}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {e.date} · {e.location}
              </Text>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
}

