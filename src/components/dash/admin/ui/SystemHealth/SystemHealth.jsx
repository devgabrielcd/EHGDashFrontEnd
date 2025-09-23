// src/components/dash/admin/ui/SystemHealth/SystemHealth.jsx
import { auth } from "@/auth";
import { Card, Divider, Progress, Empty } from "antd";
import SystemHealthFilters from "./SystemHealthFilters";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:8000";

function percent(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
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

  // 1) Empresas (público)
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

  // 2) Dados protegidos: usa o endpoint unificado
  const qs = new URLSearchParams();
  if (company && company !== "all") qs.set("company", company);
  // IMPORTANTÍSSIMO: passe a view desejada para o backend
  if (view) qs.set("view", view);

  const url = `${API_BASE}/api/users_product_mix/${qs.toString() ? `?${qs}` : ""}`;

  const res = await fetch(url, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  const json = res.ok ? await res.json() : { by_insurance: [], by_plan: [], by_form: [] };

  // 3) Monta a seção ativa
  let section = { title: "", rows: [] };

  if (view === "planTypes") {
    const byPlan = Array.isArray(json.by_plan) ? json.by_plan : [];
    section = {
      title: "Plan Types",
      rows: byPlan.map((i) => ({
        name: i.coverageType || "Unknown",
        count: i.total || 0,
      })),
    };
  } else if (view === "formTypes") {
    const byForm = Array.isArray(json.by_form) ? json.by_form : [];
    section = {
      title: "Form Types",
      rows: byForm.map((i) => ({
        name: i.formType || "Unknown",
        count: i.total || 0,
      })),
    };
  } else {
    const byInsurance = Array.isArray(json.by_insurance) ? json.by_insurance : [];
    section = {
      title: "Top Insurance Lines",
      rows: byInsurance.map((i) => ({
        name: i.insuranceCoverage || "Unknown",
        count: i.total || 0,
      })),
    };
  }

  const total = section.rows.reduce((acc, r) => acc + (r.count || 0), 0);
  const palette = ["#1677ff", "#52c41a", "#fa8c16", "#722ed1", "#13c2c2", "#eb2f96", "#a0d911"];

  return (
    <Card
      title="Product Mix"
      extra={
        <SystemHealthFilters
          companyOptions={companyOptions}
          company={company}
          view={view}
          companyKey="company"
          viewKey="view"
        />
      }
    >
      <Divider style={{ marginTop: 0, marginBottom: 12 }}>{section.title}</Divider>

      <div style={{ maxHeight: 240, overflowY: "auto", paddingRight: 8 }}>
        {section.rows.length ? (
          section.rows.map((item, idx) => (
            <div key={`${view}-${item.name}-${idx}`} style={{ marginBottom: 10 }}>
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
          ))
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sem dados" />
        )}
      </div>
    </Card>
  );
}
