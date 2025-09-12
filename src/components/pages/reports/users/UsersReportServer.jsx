// src/components/reports/users/UsersReportServer.jsx
import { auth } from "@/auth";
import UsersReportClient from "./UsersReportClient";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:8000";

// helpers de datas
function monthKey(d) { return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}`; }
function monthLabel(d, withYear) {
  const m = d.toLocaleString("default", { month: "short" });
  return withYear ? `${m} ${d.getUTCFullYear()}` : m;
}
function buildMonths(n) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const arr = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - i, 1));
    arr.push({ key: monthKey(d), date: d, count: 0 });
  }
  return arr;
}

// pequenos contadores
const inc = (map, key) => map.set(key, (map.get(key) ?? 0) + 1);
const toSortedArray = (map) =>
  [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

export default async function UsersReportServer({ months = 6, company = "all" }) {
  const session = await auth();

  // sem token → cliente mostra call-to-action
  if (!session?.accessToken) {
    return <UsersReportClient data={{}} disabled />;
  }

  // fetch usuários (filtro por empresa se vier)
  const url = new URL(`${API_BASE}/api/users/`);
  if (company !== "all") url.searchParams.set("company", company);

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  const rows = res.ok ? await res.json() : [];

  // 1) cadastros por mês (últimos N)
  const base = buildMonths(Number.isFinite(months) ? Math.max(1, Math.min(24, months)) : 6);
  const index = new Map(base.map((m, i) => [m.key, i]));
  for (const r of rows) {
    const dt = r?.datetime ? new Date(r.datetime) : null;
    if (!dt || Number.isNaN(dt.getTime())) continue;
    const k = monthKey(dt);
    const idx = index.get(k);
    if (idx !== undefined) base[idx].count += 1;
  }
  const signupsSeries = base.map((m, i, arr) => {
    const withYear = i === 0 || arr[i - 1].date.getUTCFullYear() !== m.date.getUTCFullYear();
    return { name: monthLabel(m.date, withYear), count: m.count };
  });

  // 2) origem do formulário / site
  // tenta em várias chaves comuns; cai em "Unknown"
  const srcMap = new Map();
  for (const r of rows) {
    const v =
      r.formType ??
      r.form_type ??
      r.signupSource ??
      r.signup_source ??
      r.site ??
      r.site_origin ??
      "Unknown";
    inc(srcMap, v || "Unknown");
  }
  const formSources = toSortedArray(srcMap).slice(0, 12);

  // 3) Top ZIP codes (se existir zipcode/zip/postal_code no payload)
  const zipMap = new Map();
  for (const r of rows) {
    const z = r.zipcode ?? r.zip ?? r.postal_code ?? r.postalCode ?? null;
    if (z) inc(zipMap, String(z));
  }
  const topZips = toSortedArray(zipMap).slice(0, 15);

  // 4) Planos mais escolhidos
  const planMap = new Map();
  const typeMap = new Map();
  for (const r of rows) {
    if (r.insuranceCoverage) inc(planMap, r.insuranceCoverage);
    if (r.coverageType) inc(typeMap, r.coverageType);
  }
  const topPlans = toSortedArray(planMap).slice(0, 10);
  const planTypes = toSortedArray(typeMap).slice(0, 10);

  // total geral
  const totalUsers = rows.length;

  return (
    <UsersReportClient
      data={{
        totalUsers,
        signupsSeries,
        formSources,
        topZips,
        topPlans,
        planTypes,
        months,
      }}
    />
  );
}
