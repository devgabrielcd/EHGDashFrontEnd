"use client";
import { Card, Progress, Space } from "antd";

export default function TrainingCard({ items = [] }) {
  return (
    <Card title="Training">
      <Space direction="vertical" style={{ width: "100%" }}>
        {items.map((c) => (
          <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 12 }}>
            <div style={{ fontWeight: 600 }}>{c.title}</div>
            <div style={{ width: 120 }}>
              <Progress percent={Math.round((c.progress || 0) * 100)} size="small" />
            </div>
          </div>
        ))}
      </Space>
    </Card>
  );
}
