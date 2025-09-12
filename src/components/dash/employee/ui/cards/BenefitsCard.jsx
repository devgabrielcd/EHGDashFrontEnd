"use client";
import { Card, List } from "antd";

export default function BenefitsCard({ items = [] }) {
  return (
    <Card title="Benefits">
      <List
        dataSource={items}
        renderItem={(b) => (
          <List.Item key={b.id}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <span>{b.label}</span>
              <strong>{b.value}</strong>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
}
