// src/components/dash/admin/ui/RecentActivity/RecentActivityServer.jsx
// SERVER
import { auth } from "@/auth";
import RecentActivity from "./RecentActivity";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:8000";

async function fetchRecentEntities(token, company = "all", limit = 12) {
  const url = new URL(`${API_BASE}/api/top_entities/`);
  url.searchParams.set("limit", String(limit));
  if (company !== "all") url.searchParams.set("company", String(company));

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return [];
  const data = await res.json();

  // top_entities já vem ordenado por -date_joined, mas garantimos:
  return [...data].sort(
    (a, b) => new Date(b?.datetime ?? 0) - new Date(a?.datetime ?? 0)
  );
}

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

function colorByRole(role) {
  const r = String(role || "").toLowerCase();
  if (r.includes("admin")) return "blue";
  if (r.includes("employee")) return "green";
  if (r.includes("customer")) return "purple";
  return "gray";
}

export default async function RecentActivityServer({
  company = "all",
  limit = 12,
  title = "Recent Activities",
  height = 220, // altura do scroll
}) {
  const session = await auth();
  if (!session?.accessToken) {
    return <RecentActivity title={title} items={[]} height={height} />;
  }

  const rows = await fetchRecentEntities(session.accessToken, company, limit);

  const items = rows.map((u) => {
    // API /api/top_entities/ retorna: id, username, firstName, lastName, email,
    // company_name, insuranceCoverage, coverageType, datetime
    const first = u?.firstName ?? u?.firstname ?? "";
    const last = u?.lastName ?? u?.lastname ?? "";
    const name = [first, last].filter(Boolean).join(" ").trim() || "New User";

    const companyName = u?.company_name ?? "—";
    const role = u?.user_role || "user"; // /top_entities pode não trazer user_role
    const coverage = u?.insuranceCoverage ?? null;
    const coverageType = u?.coverageType ?? null;

    const parts = [
      `New ${role}`.replace(/\s+/g, " ").trim(),          // "New user" se role ausente
      name !== "New User" ? `(${name})` : null,
      companyName !== "—" ? `— ${companyName}` : null,
      coverage ? `• ${coverage}` : null,
      coverageType ? `(${coverageType})` : null,
    ].filter(Boolean);

    return {
      time: fmtTime(u?.datetime),
      text: parts.join(" "),
      color: colorByRole(role),
    };
  });

  return <RecentActivity title={title} items={items} height={height} />;
}
