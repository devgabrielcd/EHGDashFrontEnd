"use client";
import { Card } from "antd";

export default function TimesheetCard({ data }) {
  const bars = data?.hours ?? [];
  return (
    <Card title={`Timesheet · ${data?.week || ""}`}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${bars.length || 7}, 1fr)`, gap: 8, alignItems: "end", height: 120 }}>
        {bars.map((d) => {
          const pct = Math.min(1, (d.h || 0) / 8); // 8h = “cheio”
          return (
            <div key={d.day} style={{ textAlign: "center" }}>
              <div
                title={`${d.h}h`}
                style={{
                  height: Math.max(6, Math.round(pct * 90)),
                  background: "var(--ant-color-primary)",
                  borderRadius: 6,
                  margin: "0 auto 6px",
                  width: 12,
                }}
              />
              <div style={{ fontSize: 12, opacity: 0.75 }}>{d.day}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
