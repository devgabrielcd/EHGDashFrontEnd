// Server Component
import { auth } from "@/auth";
import { Card, Space, Divider, Progress, Empty } from "antd";
import Filters from "./SystemHealthFiltersClient"; // <<< client wrapper só dos filtros

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:8000";

function percent(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}
function counterMap(rows, field) {
  const map = new Map();
  for (const r of rows) {
    const key = r?.[field] ?? "Unknown";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}
function toSortedArray(map) {
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export default async function SystemHealth({
  company = "all",
  view = "insurance",
}) {
  const session = await auth();
  if (!session?.accessToken) {
    return (
      <Card title="Product Mix">
        <div style={{ padding: 12 }}>Faça login para visualizar.</div>
      </Card>
    );
  }

  // Empresas (público)
  const companiesRes = await fetch(`${API_BASE}/company/list/`, {
    cache: "no-store",
  });
  const companiesJson = companiesRes.ok ? await companiesRes.json() : [];
  const companyOptions = [
    { label: "All", value: "all" },
    ...companiesJson
      .filter((c) => c?.id && c?.name)
      .map((c) => ({ label: c.name, value: String(c.id) })),
  ];

  // Dados protegidos
  const base = new URL(`${API_BASE}/api/users/`);
  if (company !== "all") base.searchParams.set("company", company);

  const res = await fetch(base.toString(), {
    cache: "no-store",
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  const rows = res.ok ? await res.json() : [];

  const total = rows.length;
  const byInsurance = toSortedArray(counterMap(rows, "insuranceCoverage"));
  const byCoverageType = toSortedArray(counterMap(rows, "coverageType"));
  const byFormType = toSortedArray(counterMap(rows, "formType")); // pode vir vazio

  const palette = [
    "#1677ff",
    "#52c41a",
    "#fa8c16",
    "#722ed1",
    "#13c2c2",
    "#eb2f96",
    "#a0d911",
  ];

  const section =
    view === "planTypes"
      ? { title: "Plan Types", data: byCoverageType }
      : view === "formTypes"
      ? { title: "Form Types", data: byFormType }
      : { title: "Top Insurance Lines", data: byInsurance };

  return (
    <Card
      title="Product Mix"
      extra={
        <Filters
          company={company}
          view={view}
          companyOptions={companyOptions}
        />
      }
    >
      <Divider style={{ marginTop: 0, marginBottom: 12 }}>
        {section.title}
      </Divider>

      <div style={{ maxHeight: 240, overflowY: "auto", paddingRight: 8 }}>
        {section.data.length ? (
          <Space direction="vertical" style={{ width: "100%" }}>
            {section.data.map((item, idx) => (
              <div key={`${view}-${item.name}`}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span>{item.name}</span>
                  <span>
                    {item.count} ({percent(item.count, total)}%)
                  </span>
                </div>
                <Progress
                  percent={percent(item.count, total)}
                  showInfo={false}
                  strokeColor={palette[idx % palette.length]}
                />
              </div>
            ))}
          </Space>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sem dados" />
        )}
      </div>
    </Card>
  );
}
