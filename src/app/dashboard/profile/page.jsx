// app/dashboard/profile/page.jsx
import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ProfileEditorClient from "./ProfileEditorClient";

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

  // seu NextAuth normalmente preenche session.user.id
  const userId = session?.user?.id;
  if (!userId) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Perfil</h2>
        <p className="text-red-600 mt-2">
          Não consegui identificar o seu usuário (id ausente na sessão).
        </p>
      </div>
    );
  }

  // 1) Carrega dados do usuário logado (GET permitido para self)
  let userPayload = { user: {}, profile: {} };
  try {
    userPayload = await fetchJSON(`${API_BASE}/api/users/${userId}/`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
  } catch (e) {
    console.error("Falha ao carregar /api/users/<id>/:", e?.message);
    // Se quiser tentar o legado, descomente e ajuste o id (o legado usa PK do Profile):
    // userPayload = await fetchJSON(`${API_BASE}/api/detail-user/${userId}/`, {
    //   cache: "no-store",
    //   headers: { Authorization: `Bearer ${session.accessToken}` },
    // });
  }

  // 2) Carrega lista de empresas (endpoint público)
  let companies = [];
  try {
    const companiesRes = await fetch(`${API_BASE}/company/list/`, { cache: "no-store" });
    if (companiesRes.ok) companies = await companiesRes.json();
  } catch (e) {
    console.error("Falha ao carregar /company/list/:", e?.message);
  }

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
