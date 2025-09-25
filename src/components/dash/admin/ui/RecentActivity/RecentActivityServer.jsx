// ESTE arquivo é Server Component (sem "use client")
import { auth } from "@/auth";
import RecentActivity from "./RecentActivity";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:8000";

/** Busca o feed unificado de atividades */
async function fetchActivityFeed(token, { company = "all", limit = 12 } = {}) {
  const url = new URL(`${API_BASE}/api/activity_feed/`);
  url.searchParams.set("limit", String(limit));
  if (company !== "all") url.searchParams.set("company", String(company));

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  // já vem ordenado por created_at desc no backend; garantimos formato
  return Array.isArray(data) ? data : [];
}

/** formata um ISO datetime em DD/MM/YYYY HH:mm */
function fmtTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

/** cor por tipo de ação (antd Timeline aceita: 'blue' | 'red' | 'green' | 'gray' | 'orange' | 'purple') */
function colorByAction(action = "") {
  const a = action.toLowerCase();
  if (a.startsWith("user.create") || a.startsWith("forms.submit")) return "blue";
  if (a.startsWith("user.update") || a.startsWith("prefs.") || a.startsWith("integrations.")) return "green";
  if (a.startsWith("user.delete") || a.startsWith("session.revoke")) return "red";
  if (a.startsWith("password.")) return "orange";
  if (a.startsWith("auth.login")) return "purple";
  if (a.startsWith("auth.logout")) return "gray";
  return "gray";
}

/** rótulo amigável para a ação */
function labelForAction(action = "") {
  const a = action.toLowerCase();
  if (a === "user.create") return "User created";
  if (a === "user.update" || a === "user.update.self") return "User updated";
  if (a === "user.delete" || a === "user.delete.self") return "User deleted";
  if (a === "password.change") return "Password changed";
  if (a === "prefs.update") return "Preferences updated";
  if (a === "integrations.update") return "Integrations updated";
  if (a === "session.revoke") return "Session revoked";
  if (a === "auth.login") return "Login";
  if (a === "auth.logout") return "Logout";
  if (a === "forms.submit") return "Form submitted";
  return action || "Activity";
}

function fullName(obj = {}) {
  const f = obj.firstName || obj.first_name || "";
  const l = obj.lastName || obj.last_name || "";
  return [f, l].filter(Boolean).join(" ").trim();
}

/** Monta a linha de texto para cada item */
function buildText(row) {
  const label = labelForAction(row.action);
  const actor = fullName(row.actor || {}) || row?.actor?.username || "System";
  const target =
    fullName(row.target || {}) || row?.target?.username || null;
  const company = row.company_name || null;
  const msg = row.message || null;

  const parts = [label];
  parts.push(`by ${actor}`);
  if (target) parts.push(`→ ${target}`);
  if (company) parts.push(`— ${company}`);
  if (msg) parts.push(`• ${msg}`);

  return parts.join(" ");
}

/**
 * Server wrapper: pega sessão, consulta o feed e converte para itens do componente RecentActivity
 */
export default async function RecentActivityServer({
  company = "all",
  limit = 12,
  title = "Recent Activities",
  height = 220,
}) {
  const session = await auth();
  if (!session?.accessToken) {
    return <RecentActivity title={title} items={[]} height={height} />;
  }

  const rows = await fetchActivityFeed(session.accessToken, { company, limit });

  const items = rows.map((row) => ({
    time: fmtTime(row.datetime),
    text: buildText(row),
    color: colorByAction(row.action),
  }));

  return <RecentActivity title={title} items={items} height={height} />;
}
