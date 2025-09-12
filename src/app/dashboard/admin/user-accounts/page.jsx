"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { App, Card, Table, Tag, Space } from "antd";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import UserToolbar from "@/components/dash/admin/user-accounts/UserToolbar";
import UserForm from "@/components/dash/admin/user-accounts/UserForm";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:8000";

/* ----------------- Helpers ----------------- */
const clean = (v) => (v == null ? "" : String(v).trim());
const ROLE_LIKE = new Set(["admin","employee","staff","customer","owner","manager","-"]);
const sanitizePlanish = (raw) => {
  const s = clean(raw);
  if (!s || ROLE_LIKE.has(s.toLowerCase())) return "—";
  return s;
};

async function fetchJSON(url, token) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);
  return data;
}

const deriveOptions = (users, field) => {
  const set = new Set();
  for (const u of users || []) {
    const v = clean(u?.[field]);
    if (v && !ROLE_LIKE.has(v.toLowerCase())) set.add(v);
  }
  return [...set].sort().map((v) => ({ label: v, value: v }));
};

/* ----------------- Page ----------------- */
export default function UsersManagementPage() {
  const { message } = App.useApp();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // estados principais
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // toolbar / query params (persistentes)
  const q = searchParams.get("q") || "";
  const companyFilter = searchParams.get("company") || "";

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editDetail, setEditDetail] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // combos
  const [userRoles, setUserRoles] = useState([]);
  const [userTypes, setUserTypes] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [coverageOptions, setCoverageOptions] = useState([]);
  const [planTypeOptions, setPlanTypeOptions] = useState([]);

  const authedFetch = useCallback(
    (url) => fetchJSON(url, session?.accessToken),
    [session?.accessToken]
  );

  const updateQuery = useCallback((patch) => {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === "" || v == null) sp.delete(k);
      else sp.set(k, String(v));
    });
    router.push(`${pathname}?${sp.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const fetchData = useCallback(async () => {
    if (status !== "authenticated" || !session?.accessToken) {
      if (status !== "loading") message.error("You need to be authenticated.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);

      const url = new URL(`${API_BASE}/api/users/`);
      if (q) url.searchParams.set("q", q);
      if (companyFilter) url.searchParams.set("company", companyFilter);

      const [users, roles, types, companies] = await Promise.all([
        authedFetch(url.toString()),
        authedFetch(`${API_BASE}/api/roles/`),
        authedFetch(`${API_BASE}/api/types/`),
        fetch(`${API_BASE}/company/list/`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])),
      ]);

      const usersArr = Array.isArray(users) ? users : [];
      setRows(usersArr);

      setUserRoles(roles.map((r) => ({ label: r.name ?? r.user_role ?? String(r.id), value: r.id })));
      setUserTypes(types.map((t) => ({ label: t.name ?? t.user_type ?? String(t.id), value: t.id })));

      setCompanyOptions(
        [{ label: "All companies", value: "" }].concat(
          (companies || [])
            .filter((c) => c?.id && c?.name)
            .map((c) => ({ label: c.name, value: String(c.id) }))
        )
      );

      // enquanto não há endpoints dedicados, derivamos das linhas
      setCoverageOptions(deriveOptions(usersArr, "insuranceCoverage"));
      setPlanTypeOptions(deriveOptions(usersArr, "coverageType"));
    } catch (err) {
      console.error(err);
      message.error(err.message || "Failed to load data");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [status, session?.accessToken, q, companyFilter, authedFetch, message]);

  useEffect(() => {
    if (status === "authenticated") fetchData();
  }, [status, fetchData]);

  const openCreate = () => {
    setEditingId(null);
    setEditDetail(null);
    setModalOpen(true);
  };

  // Edit usa o endpoint correto (ID de USER)
  const openEdit = async (flatRow) => {
    try {
      setEditingId(flatRow.id);
      const detail = await authedFetch(`${API_BASE}/api/users/${flatRow.id}/`);
      setEditDetail(detail);
      setModalOpen(true);
    } catch (err) {
      console.error(err);
      message.error(err.message || "Failed to load user detail");
    }
  };

  const handleSave = async (values) => {
    const isEdit = !!editingId;
    const endpoint = isEdit ? `${API_BASE}/api/users/${editingId}/` : `${API_BASE}/api/users/`;
    const method = isEdit ? "PATCH" : "POST";

    const payload = {
      username: values.username,
      email: values.email,
      password: values.password, // undefined no edit -> backend ignora
      first_name: values.first_name,
      last_name: values.last_name,
      user_role_id: values.user_role_id,
      user_type_id: values.user_type_id,
      // ESSENCIAIS para salvar no Profile (backend já aceita):
      company_id: values.company_id || null,
      insuranceCoverage: values.insuranceCoverage || null,
      coverageType: values.coverageType || null,
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
      const data = await res.json().catch(() => ({}));
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

  const columns = useMemo(() => ([
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Username", dataIndex: "username", key: "username", render: (v) => v || "—" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Active",
      dataIndex: "is_active",
      key: "is_active",
      render: (v) => <Tag color={v ? "green" : "red"}>{v ? "Yes" : "No"}</Tag>,
      width: 100,
    },
    { title: "User Role", dataIndex: "user_role", key: "user_role", render: (v) => <Tag color="geekblue">{v || "—"}</Tag> },
    { title: "User Type", dataIndex: "user_type", key: "user_type", render: (v) => <Tag color="purple">{v || "—"}</Tag> },

    // NOVA COLUNA Company
    {
      title: "Company",
      dataIndex: "company_name",
      key: "company_name",
      render: (v) => v || "—",
      sorter: (a, b) => (a.company_name || "").localeCompare(b.company_name || ""),
    },

    { title: "Plan Coverage", dataIndex: "insuranceCoverage", key: "insuranceCoverage", render: (v) => <Tag color="blue">{sanitizePlanish(v)}</Tag> },
    { title: "Plan Type", dataIndex: "coverageType", key: "coverageType", render: (v) => <Tag color="orange">{sanitizePlanish(v)}</Tag> },

    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <UserToolbar.EditButton onClick={() => openEdit(record)} />
          <UserToolbar.DeleteButton onConfirm={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ]), [openEdit]);

  return (
    <Card
      title={
        <UserToolbar
          searchValue={q}
          onSearch={(val) => updateQuery({ q: val })}
          companyValue={companyFilter}
          companyOptions={companyOptions}
          onChangeCompany={(val) => updateQuery({ company: val })}
          onCreate={openCreate}
          onReload={fetchData}
        />
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
        companyOptions={companyOptions}
        coverageOptions={coverageOptions}
        planTypeOptions={planTypeOptions}
      />
    </Card>
  );
}
