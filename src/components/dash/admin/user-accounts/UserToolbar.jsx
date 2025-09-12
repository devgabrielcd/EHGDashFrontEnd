"use client";

import React from "react";
import { Space, Input, Button, Select, Popconfirm } from "antd";
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

export default function UserToolbar({
  searchValue,
  onSearch,
  companyValue,
  companyOptions = [],
  onChangeCompany,
  onCreate,
  onReload,
}) {
  return (
    <Space style={{ width: "100%", justifyContent: "space-between" }}>
      <span>User Management</span>
      <Space>
        <Input.Search
          allowClear
          placeholder="Search by username or email"
          defaultValue={searchValue}
          onSearch={onSearch}
          style={{ width: 280 }}
        />
        <Select
          allowClear
          placeholder="Filter by company"
          style={{ width: 220 }}
          value={companyValue || undefined}
          onChange={(v) => onChangeCompany(v || "")}
          options={companyOptions}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
          Create
        </Button>
        <Button icon={<ReloadOutlined />} onClick={onReload} />
      </Space>
    </Space>
  );
}

/* ---------- small action buttons used in table ---------- */
function EditButton({ onClick }) {
  return <Button icon={<EditOutlined />} onClick={onClick} />;
}

function DeleteButton({ onConfirm }) {
  return (
    <Popconfirm title="Delete this user?" onConfirm={onConfirm} okText="Yes" cancelText="No">
      <Button icon={<DeleteOutlined />} danger />
    </Popconfirm>
  );
}

UserToolbar.EditButton = EditButton;
UserToolbar.DeleteButton = DeleteButton;
