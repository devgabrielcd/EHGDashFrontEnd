"use client";
import { Card } from "antd";

export default function KPIGrid({ items = [] }) {
  return (
    <Card title="My KPIs">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {items.map((k) => (
          <div
            key={k.label}
            style={{
              border: "1px solid var(--ant-color-border-secondary)",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.8 }}>{k.label}</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginTop: 4 }}>{k.value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
