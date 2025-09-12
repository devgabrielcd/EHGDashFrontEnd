import { auth } from "@/auth";
import { Card } from "antd";
import TopEntitiesClient from "./TopEntitiesClient";
import TopEntitiesFiltersClient from "./TopEntitiesFiltersClient";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:8000";

export default async function TopEntitiesServer({ company = "all" }) {
  const session = await auth();

  // opções de empresa (server)
  const compRes = await fetch(`${API_BASE}/company/list/`, { cache: "no-store" });
  const compJson = compRes.ok ? await compRes.json() : [];
  const companyOptions = [
    { label: "All", value: "all" },
    ...compJson.filter(c => c?.id && c?.name).map(c => ({ label: c.name, value: String(c.id) })),
  ];

  if (!session?.accessToken) {
    return (
      <Card title="Latest users" extra={<TopEntitiesFiltersClient value={company} options={companyOptions} />}>
        <div style={{ padding: 12 }}>Faça login para visualizar.</div>
      </Card>
    );
  }

  const base = new URL(`${API_BASE}/api/users/`);
  if (company !== "all") base.searchParams.set("company", company);

  const res = await fetch(base.toString(), {
    cache: "no-store",
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  const rows = res.ok ? await res.json() : [];

  return (
    <Card
      title="Latest users"
      extra={<TopEntitiesFiltersClient value={company} options={companyOptions} />}
    >
      <TopEntitiesClient rows={rows} />
    </Card>
  );
}
