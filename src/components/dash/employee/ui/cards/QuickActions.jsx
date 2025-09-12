"use client";
import Link from "next/link";
import { Card, Button, Space } from "antd";

export default function QuickActions({ items = [] }) {
  return (
    <Card title="Quick Actions">
      <Space direction="vertical" style={{ width: "100%" }}>
        {items.map((it) => (
          <Link key={it.key} href={it.href}>
            <Button block>{it.label}</Button>
          </Link>
        ))}
      </Space>
    </Card>
  );
}
