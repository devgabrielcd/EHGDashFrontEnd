// SERVER
import { auth } from "@/auth";
import RecentActivityClient from "./RecentActivityClient";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:8000";

async function fetchUsers(token, company = "all", limit = 12) {
  const url = new URL(`${API_BASE}/api/users/`);
  if (company !== "all") url.searchParams.set("company", company);

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return [];
  const data = await res.json();

  return [...data]
    .sort((a, b) => new Date(b?.datetime ?? 0) - new Date(a?.datetime ?? 0))
    .slice(0, limit);
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
  height = 220, // << altura padrão do scroll
}) {
  const session = await auth();
  if (!session?.accessToken) {
    return <RecentActivity title={title} items={[]} height={height} />;
  }

  const rows = await fetchUsers(session.accessToken, company, limit);

  const items = rows.map((u) => {
    const name = [u?.firstName ?? u?.firstname, u?.lastName ?? u?.lastname]
      .filter(Boolean)
      .join(" ")
      .trim() || "New User";

    const companyName = u?.company_name ?? u?.company ?? "—";
    const role = u?.user_role ?? "—";
    const coverage = u?.insuranceCoverage ?? null;
    const coverageType = u?.coverageType ?? null;

    const parts = [
      `New ${role}`.replace(/\s+/g, " ").trim(),
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

  return <RecentActivityClient title={title} items={items} height={height} />;
}
