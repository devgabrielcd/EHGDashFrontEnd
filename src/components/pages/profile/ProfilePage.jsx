// app/dashboard/profile/page.jsx
import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

// ======== SERVER PAGE (SSR) ========
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:8000";

async function fetchJSON(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} - ${txt || res.statusText}`);
  }
  return res.json();
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session) return redirect("/signin?next=/dashboard/profile");

  const userId = session?.user?.id;
  if (!userId) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Perfil</h2>
        <p className="text-red-600 mt-2">Não consegui identificar o seu usuário (id ausente na sessão).</p>
      </div>
    );
  }

  // Busca dados do usuário (self) e lista de empresas (pública)
  // /api/users/<id>/ -> GET permitido para self (segundo seu backend)
  let userPayload = { user: {}, profile: {} };
  let companies = [];
  try {
    userPayload = await fetchJSON(`${API_BASE}/api/users/${userId}/`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
  } catch (e) {
    // fallback ao endpoint legado, se necessário (descomente se quiser)
    // userPayload = await fetchJSON(`${API_BASE}/api/detail-user/${userId}/`, {
    //   cache: "no-store",
    //   headers: { Authorization: `Bearer ${session.accessToken}` },
    // });
    console.error("Falha ao carregar /api/users/<id>/:", e?.message);
  }

  try {
    const companiesRes = await fetch(`${API_BASE}/company/list/`, { cache: "no-store" });
    if (companiesRes.ok) {
      companies = await companiesRes.json();
    }
  } catch (e) {
    console.error("Falha ao carregar /company/list/:", e?.message);
  }

  // props para o client
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Meu Perfil</h2>
      <ProfileEditorClient
        initialUser={userPayload?.user || {}}
        initialProfile={userPayload?.profile || {}}
        companies={companies}
        apiBase={API_BASE}
        accessToken={session.accessToken}
      />
    </div>
  );
}

// ======== CLIENT FORM (CSR) ========
"use client";

import { useMemo, useState } from "react";
import { Form, Input, Button, Select, Row, Col, Divider, App, Typography } from "antd";

function toInitialValues(user = {}, profile = {}) {
  // Monta valores do form a partir do payload do backend
  return {
    username: user?.username ?? "",
    email: user?.email ?? profile?.email ?? "",
    first_name: profile?.first_name ?? user?.first_name ?? "",
    last_name: profile?.last_name ?? user?.last_name ?? "",
    phone_number: profile?.phone_number ?? "",
    company_id: profile?.company ?? profile?.company_id ?? null, // depende de como vem no seu payload
    coverageType: profile?.coverageType ?? "", // 'individual'|'family' (ou o que você usar)
    insuranceCoverage: profile?.insuranceCoverage ?? "", // 'Medicare'|'Dental'|...
    // password (opcional): só enviaremos se preenchido
    password: "",
  };
}

function mapToPatchBody(values) {
  // O seu backend aceita estes campos em PATCH /api/users/<id>/
  // - user: username, email, password, is_active
  // - profile: first_name, middle_name, last_name, phone_number, email
  // - planos: coverageType, insuranceCoverage
  // - relacionamentos: user_role_id, user_type_id, company_id
  const body = {
    username: values.username?.trim(),
    email: values.email?.trim(),
    first_name: values.first_name?.trim(),
    last_name: values.last_name?.trim(),
    phone_number: values.phone_number?.trim(),
    coverageType: values.coverageType || null,
    insuranceCoverage: values.insuranceCoverage || null,
    company_id: values_
