// NADA de "use client" aqui — é Server Component
import { auth } from "@/auth";
import { Card } from "antd";
import RevenueChartClient from "./RevenueChartClient";
import RevenueChartFiltersClient from "./RevenueChartFiltersClient";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:8000";

export default async function RevenueChartServer({
  title = "Clients Added",
  months = 12,
  company = "all",
}) {
  const session = await auth();

  // companies (público)
  let companyOptions = [{ label: "All", value: "all" }];
  try {
    const res = await fetch(`${API_BASE}/company/list/`, { cache: "no-store" });
    if (res.ok) {
      const companies = await res.json();
      companyOptions = [
        { label: "All", value: "all" },
        ...companies
          .filter((c) => c?.id && c?.name)
          .map((c) => ({ label: c.name, value: String(c.id) })),
      ];
    }
  } catch {}

  if (!session?.accessToken) {
    return (
      <Card
        title={title}
        extra={
          <RevenueChartFiltersClient
            period={months}
            company={company}
            companyOptions={companyOptions}
          />
        }
      >
        <div style={{ padding: 12 }}>Faça login para visualizar.</div>
      </Card>
    );
  }

  const url = new URL(`${API_BASE}/api/revenue_series/`);
  url.searchParams.set("period", String(months));
  if (company && company !== "all") {
    url.searchParams.set("company", String(company));
  }

  let series = [];
  try {
    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    if (res.ok) series = await res.json();
  } catch {}

  return (
    <Card
      title={`${title} (last ${months} months)`}
      extra={
        <RevenueChartFiltersClient
          period={months}
          company={company}
          companyOptions={companyOptions}
        />
      }
    >
      <div style={{ height: 280 }}>
        <RevenueChartClient data={series} />
      </div>
    </Card>
  );
}
