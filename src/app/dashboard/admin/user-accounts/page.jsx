"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Popconfirm,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const API_USERS = "/api/users/users/";
const API_ROLES = "/api/users/roles/";
const API_TYPES = "/api/users/types/";

const fetcher = (url) =>
  fetch(url, { credentials: "include" }).then((r) => {
    if (!r.ok) throw new Error("Request failed");
    return r.json();
  });

const toOptions = (arr) => (arr || []).map((x) => ({ label: x.name, value: x.id }));

export default function UsersPage() {
  // filtros
  const [q, setQ] = useState("");
  const [active, setActive] = useState(undefined);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (active !== undefined) p.set("active", active ? "1" : "0");
    p.set("limit", "50");
    p.set("offset", "0");
    return `${API_USERS}?${p.toString()}`;
  }, [q, active]);

  const { data, isLoading, mutate } = useSWR(query, fetcher);
  const rows = data?.results || [];

  // opções para selects
  const { data: rolesData } = useSWR(API_ROLES, fetcher);
  const { data: typesData } = useSWR(API_TYPES, fetcher);
  const roleOptions = toOptions(rolesData);
  const typeOptions = toOptions(typesData);

  // EDIT modal
  const [editOpen, setEditOpen] = useState(false);
  const [editForm] = Form.useForm();

  // CREATE modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm();

  const openEdit = (record) => {
    editForm.setFieldsValue({
      id: record?.user?.id,
      username: record?.user?.username,
      email: record?.user?.email,
      first_name: record?.user?.first_name,
      last_name: record?.user?.last_name,
      is_active: record?.user?.is_active,
      user_role_id: record?.profile?.user_role_id,
      user_type_id: record?.profile?.user_type_id,
      department: record?.profile?.department,
      job_title: record?.profile?.job_title,
      location: record?.profile?.location,
      phone_number: record?.profile?.phone_number,
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    try {
      const values = await editForm.validateFields();
      const res = await fetch(`${API_USERS}${values.id}/`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to update");
      message.success("User updated");
      setEditOpen(false);
      editForm.resetFields();
      mutate();
    } catch (e) {
      console.error(e);
      message.error("Error updating user");
    }
  };

  const onDelete = async (id, hard = false) => {
    try {
      const res = await fetch(`${API_USERS}${id}/?hard=${hard ? "1" : "0"}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      message.success(hard ? "User removed" : "User deactivated");
      mutate();
    } catch (err) {
      console.error(err);
      message.error("Error deleting user");
    }
  };

  const openCreate = () => {
    createForm.resetFields();
    // default: active = true
    createForm.setFieldsValue({ is_active: true });
    setCreateOpen(true);
  };

  const saveCreate = async () => {
    try {
      const values = await createForm.validateFields();
      const res = await fetch(API_USERS, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "Failed to create");
      }
      message.success("User created");
      setCreateOpen(false);
      createForm.resetFields();
      mutate();
    } catch (e) {
      console.error(e);
      message.error(e.message || "Error creating user");
    }
  };

  const columns = [
    { title: "ID", dataIndex: ["user", "id"], width: 70 },
    { title: "Username", dataIndex: ["user", "username"] },
    { title: "Name", render: (_, r) => `${r.user.first_name || ""} ${r.user.last_name || ""}`.trim() || "—" },
    { title: "Email", dataIndex: ["user", "email"] },
    {
      title: "Role",
      render: (_, r) => r.profile?.user_role ? <Tag>{r.profile.user_role}</Tag> : <span>—</span>,
      width: 120,
    },
    {
      title: "Type",
      render: (_, r) => r.profile?.user_type ? <Tag color="blue">{r.profile.user_type}</Tag> : <span>—</span>,
      width: 120,
    },
    {
      title: "Active",
      dataIndex: ["user", "is_active"],
      width: 90,
      render: (v) => (v ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>),
    },
    {
      title: "Actions",
      key: "actions",
      width: 220,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Deactivate user?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => onDelete(record.user.id, false)}
          >
            <Button icon={<DeleteOutlined />} danger size="small">
              Deactivate
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Delete permanently?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
            onConfirm={() => onDelete(record.user.id, true)}
          >
            <Button size="small">Hard Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <Input.Search
          allowClear
          placeholder="Search by username, email, name…"
          onSearch={setQ}
          style={{ maxWidth: 360 }}
          enterButton
        />
        <Select
          value={active}
          onChange={setActive}
          placeholder="Active?"
          style={{ width: 140 }}
          options={[
            { label: "All", value: undefined },
            { label: "Active", value: true },
            { label: "Inactive", value: false },
          ]}
        />
        <Button icon={<ReloadOutlined />} onClick={() => mutate()} />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          New User
        </Button>
      </div>

      {/* Table */}
      <Table
        rowKey={(r) => r.user.id}
        loading={isLoading}
        dataSource={rows}
        columns={columns}
        pagination={false}
      />

      {/* Edit Modal */}
      <Modal
        title={`Edit User #${editForm.getFieldValue("id") || ""}`}
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={saveEdit}
        okText="Save"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="id" style={{ display: "none" }}>
            <Input type="hidden" />
          </Form.Item>

          <Form.Item label="Username" name="username">
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ type: "email", message: "Invalid email" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="First name" name="first_name">
            <Input />
          </Form.Item>
          <Form.Item label="Last name" name="last_name">
            <Input />
          </Form.Item>

          <Form.Item label="Password (set new)" name="password">
            <Input.Password placeholder="Leave blank to keep current" />
          </Form.Item>

          <Form.Item label="Active" name="is_active" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="Role" name="user_role_id">
            <Select
              placeholder="Select a role"
              options={roleOptions}
              allowClear
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item label="Type" name="user_type_id">
            <Select
              placeholder="Select a type"
              options={typeOptions}
              allowClear
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item label="Department" name="department">
            <Input />
          </Form.Item>
          <Form.Item label="Job title" name="job_title">
            <Input />
          </Form.Item>
          <Form.Item label="Location" name="location">
            <Input />
          </Form.Item>
          <Form.Item label="Phone number" name="phone_number">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Modal */}
      <Modal
        title="New User"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={saveCreate}
        okText="Create"
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Email is required" }, { type: "email", message: "Invalid email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Password is required" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item label="Username" name="username" tooltip="Defaults to email if empty">
            <Input />
          </Form.Item>
          <Form.Item label="First name" name="first_name">
            <Input />
          </Form.Item>
          <Form.Item label="Last name" name="last_name">
            <Input />
          </Form.Item>

          <Form.Item label="Active" name="is_active" valuePropName="checked" initialValue={true}>
            <Switch defaultChecked />
          </Form.Item>

          <Form.Item label="Role" name="user_role_id">
            <Select
              placeholder="Select a role"
              options={roleOptions}
              allowClear
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item label="Type" name="user_type_id">
            <Select
              placeholder="Select a type"
              options={typeOptions}
              allowClear
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item label="Department" name="department">
            <Input />
          </Form.Item>
          <Form.Item label="Job title" name="job_title">
            <Input />
          </Form.Item>
          <Form.Item label="Location" name="location">
            <Input />
          </Form.Item>
          <Form.Item label="Phone number" name="phone_number">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
