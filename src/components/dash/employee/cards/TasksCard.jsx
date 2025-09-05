"use client";
import { Card, Table, Tag } from "antd";

export default function TasksCard({ tasks = [] }) {
  const columns = [
    { title: "Task", dataIndex: "title", key: "title", ellipsis: true },
    { title: "Due", dataIndex: "due", key: "due", width: 110 },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (p) => {
        const color = p === "High" ? "red" : p === "Medium" ? "orange" : "default";
        return <Tag color={color.toString()}>{p}</Tag>;
      },
    },
    { title: "Status", dataIndex: "status", key: "status", width: 120 },
  ];

  return (
    <Card title="My Tasks">
      <Table
        rowKey="id"
        dataSource={tasks}
        columns={columns}
        size="small"
        pagination={{ pageSize: 5 }}
      />
    </Card>
  );
}
