"use client";

import React from "react";
import { Card, Timeline, Typography } from "antd";

const { Text } = Typography;

/**
 * Props:
 * - title?: string
 * - items?: Array<{ time: string; text: string; color?: string }>
 * - height?: number | string
 */
export default function RecentActivity({
  items = [],
  title = "Recent Activities",
  height = 220,
}) {
  const containerStyle = {
    maxHeight: typeof height === "number" ? `${height}px` : height,
    overflowY: "auto",
    paddingRight: 8,
  };

  return (
    <Card title={title}>
      <div style={containerStyle} tabIndex={-1}>
        <Timeline
          items={(items ?? []).map((a) => ({
            color: a.color || "blue",
            children: (
              <div>
                <Text strong>{a.time}</Text>
                <div>{a.text}</div>
              </div>
            ),
          }))}
        />
      </div>
    </Card>
  );
}
