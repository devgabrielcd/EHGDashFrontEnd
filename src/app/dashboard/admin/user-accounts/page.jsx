// src/app/dashboard/admin/user-accounts/page.jsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  App,
  Card,
  Table,
  Tag,
  Space,
  Input,
  Button,
  Popconfirm,
  Modal,
  Form,
  Select,
} from "antd";
import {
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:8000";

/** -------- Modal de Create/Edit -------- */
const UserForm = ({
  open,
  onCancel,
  onSave,
  initialData, // { user: {...}, profile: {...} } (somente no Edit)
  isEdit,
  roles,
  types,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    if (initialData?.user) {
      form.setFieldsValue({
        username: initialData.user.username,
        email: initialData.user.email,
        first_name: initialData.user.first_name,
        last_name: initialData.user.last_name,
        user_role_id: initialData.profile?.user_role_id,
        user_type_id: initialData.profile?.user_type_id,
      });
    } else {
      form.resetFields();
    }
  }, [initialData, open, form]);

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => onSave(values))
      .catch(() => {});
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit User" : "Create New User"}
      okText={isEdit ? "Update" : "Create"}
      onCancel={onCancel}
      onOk={handleSave}
    >
      <Form form={form} layout="vertical" name="user_form">
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please input the username!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please input the email!" },
            { type: "email" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={isEdit ? [] : [{ required: true, message: "Please input the password!" }]}
        >
          <Input.Password placeholder={isEdit ? "Leave blank to keep current password" : ""} />
        </Form.Item>

        <Form.Item name="first_name" label="First Name">
          <Input />
        </Form.Item>

        <Form.Item name="last_name" label="Last Name">
          <Input />
        </Form.Item>

        <Form.Item
          name="user_role_id"
          label="User Role"
          rules={[{ required: true, message: "Please select a role!" }]}
        >
          <Select options={roles} />
        </Form.Item>

        <Form.Item
          name="user_type_id"
          label="User Type"
          rules={[{ required: true, message: "Please select a type!" }]}
        >
          <Select options={types} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

/** -------- Página -------- */
export default function UsersManagementPage() {
  const { message } = App.useApp();
  const { data: session, status } = useSession();

  const [rows, setRows] = useState([]);            // lista achatada do /api/users/
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editDetail, setEditDetail] = useState(null); // detalhe {user, profile} para o Edit
  const [editingId, setEditingId] = useState(null);   // id do usuário sendo editado

  const [userRoles, setUserRoles] = useState([]);
  const [userTypes, setUserTypes] = useState([]);

  /** Helpers de fetch com Bearer */
  const fetchJSON = useCallback(
    async (url) => {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);
      return data;
    },
    [session?.accessToken]
  );

  /** Carrega lista achatada + selects */
  const fetchData = useCallback(async () => {
    if (status !== "authenticated" || !session?.accessToken) {
      if (status !== "loading") message.error("You need to be authenticated.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);

      const url = new URL(`${API_BASE}/api/users/`);
      if (search) url.searchParams.set("q", search);

      const [users, roles, types] = await Promise.all([
        fetchJSON(url.toString()),                   // 👈 array achatado
        fetchJSON(`${API_BASE}/api/roles/`),         // [{id, name}]
        fetchJSON(`${API_BASE}/api/types/`),         // [{id, name}]
      ]);

      setRows(Array.isArray(users) ? users : []);    // 👈 SEM .results
      setUserRoles(roles.map((r) => ({ label: r.name, value: r.id })));
      setUserTypes(types.map((t) => ({ label: t.name, value: t.id })));
    } catch (err) {
      console.error(err);
      message.error(err.message || "Failed to load data");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [status, session?.accessToken, search, fetchJSON, message]);

  useEffect(() => {
    if (status === "authenticated") fetchData();
  }, [status, fetchData]);

  /** Abrir modal de criação */
  const openCreate = () => {
    setEditingId(null);
    setEditDetail(null);
    setModalOpen(true);
  };

  /** Abrir modal de edição: busca detalhe no endpoint legado /api/detail-user/<id>/ */
  const openEdit = async (flatRow) => {
    try {
      setEditingId(flatRow.id); // id vem do shape achatado
      const detail = await fetchJSON(`${API_BASE}/api/detail-user/${flatRow.id}/`);
      // detail = { user: {...}, profile: {...} } com user_role_id/user_type_id
      setEditDetail(detail);
      setModalOpen(true);
    } catch (err) {
      console.error(err);
      message.error(err.message || "Failed to load user detail");
    }
  };

  /** Criar/Atualizar */
  const handleSave = async (values) => {
    const isEdit = !!editingId;
    const endpoint = isEdit
      ? `${API_BASE}/api/users/${editingId}/`
      : `${API_BASE}/api/users/`;
    const method = isEdit ? "PATCH" : "POST";

    const payload = {
      username: values.username,
      email: values.email,
      password: values.password,          // pode ser undefined no edit (servidor ignora)
      first_name: values.first_name,
      last_name: values.last_name,
      user_role_id: values.user_role_id,
      user_type_id: values.user_type_id,
    };

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);

      message.success(isEdit ? "User updated!" : "User created!");
      setModalOpen(false);
      setEditingId(null);
      setEditDetail(null);
      fetchData();
    } catch (err) {
      console.error(err);
      message.error(err.message || "Failed to save user");
    }
  };

  /** Deletar */
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || `HTTP ${res.status}`);
      }
      message.success("User deleted!");
      fetchData();
    } catch (err) {
      console.error(err);
      message.error(err.message || "Failed to delete user");
    }
  };

  /** Colunas para o shape achatado */
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (v) => v || "—",
    },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Active",
      dataIndex: "is_active",
      key: "is_active",
      render: (v) => <Tag color={v ? "green" : "red"}>{v ? "Yes" : "No"}</Tag>,
      width: 100,
    },

    // 👇 NOVAS COLUNAS: user_role / user_type (vindas da API /api/users/)
    {
      title: "Uer Role",
      dataIndex: "user_role",
      key: "user_role",
      render: (v) => <Tag color="geekblue">{v || "—"}</Tag>,
    },
    {
      title: "User Type",
      dataIndex: "user_type",
      key: "user_type",
      render: (v) => <Tag color="purple">{v || "—"}</Tag>,
    },

    // Planos (mantidos)
    {
      title: "Plan Coverage",
      dataIndex: "insuranceCoverage",
      key: "insuranceCoverage",
      render: (v) => <Tag color="blue">{v || "—"}</Tag>,
    },
    {
      title: "Plan Type",
      dataIndex: "coverageType",
      key: "coverageType",
      render: (v) => <Tag color="orange">{v || "—"}</Tag>,
    },

    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm
            title="Delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (status === "loading") return <div>Loading...</div>;

  return (
    <Card
      title={
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <span>User Management</span>
          <Space>
            <Input.Search
              allowClear
              placeholder="Search by username or email"
              onSearch={setSearch}
              style={{ width: 280 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Create
            </Button>
            <Button icon={<ReloadOutlined />} onClick={fetchData} />
          </Space>
        </Space>
      }
    >
      <Table
        size="small"
        rowKey="id"
        dataSource={rows}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: false }}
      />

      <UserForm
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingId(null);
          setEditDetail(null);
        }}
        onSave={handleSave}
        initialData={editDetail}
        isEdit={!!editingId}
        roles={userRoles}
        types={userTypes}
      />
    </Card>
  );
}
