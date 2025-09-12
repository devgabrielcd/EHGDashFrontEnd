import { auth } from "@/auth";
import { Card } from "antd";
import RevenueChartClient from "./RevenueChartClient";
import RevenueChartFiltersClient from "./RevenueChartFiltersClient";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:8000";

function monthKey(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
function labelMonth(d, withYear) {
  const label = d.toLocaleString("default", { month: "short" });
  return withYear ? `${label} ${d.getUTCFullYear()}` : label;
}
function buildMonths(n) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - i, 1));
    out.push({ key: monthKey(d), date: d, count: 0 });
  }
  return out;
}

async function fetchCompanies() {
  try {
    const res = await fetch(`${API_BASE}/company/list/`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function RevenueChartServer({ title = "Clients Added", months = 12, company = "all" }) {
  const session = await auth();
  const m = Number.isFinite(months) ? Math.max(1, Math.min(24, months)) : 12;

  const companiesJson = await fetchCompanies();
  const companyOptions = [
    { label: "All", value: "all" },
    ...companiesJson.filter(c => c?.id && c?.name).map(c => ({ label: c.name, value: String(c.id) })),
  ];

  if (!session?.accessToken) {
    return (
      <Card
        title={title}
        extra={<RevenueChartFiltersClient period={m} company={company} companyOptions={companyOptions} />}
      >
        <div style={{ padding: 12 }}>Faça login para visualizar.</div>
      </Card>
    );
  }

  const baseUrl = new URL(`${API_BASE}/api/users/`);
  if (company !== "all") baseUrl.searchParams.set("company", company);

  const res = await fetch(baseUrl.toString(), {
    cache: "no-store",
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  const rows = res.ok ? await res.json() : [];

  const base = buildMonths(m);
  const index = new Map(base.map((b, i) => [b.key, i]));

  for (const r of rows) {
    const dt = r?.datetime ? new Date(r.datetime) : null;
    if (!dt || Number.isNaN(dt.getTime())) continue;
    const key = monthKey(dt);
    const idx = index.get(key);
    if (idx !== undefined) base[idx].count += 1;
  }

  const series = base.map((b, i, arr) => {
    const withYear = i === 0 || arr[i - 1].date.getUTCFullYear() !== b.date.getUTCFullYear();
    return { name: labelMonth(b.date, withYear), count: b.count };
  });

  return (
    <Card
      title={`${title} (last ${m} months)`}
      extra={<RevenueChartFiltersClient period={m} company={company} companyOptions={companyOptions} />}
    >
      <div style={{ height: 280 }}>
        <RevenueChartClient data={series} />
      </div>
    </Card>
  );
}
