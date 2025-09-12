import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { API_BASE, safeFetchJSON } from "@/lib/api";
import ReportBuilderServer from "@/components/pages/reports/builder/ReportBuilderServer";
import { Card, Typography } from "antd";

const { Title, Text } = Typography;

export default async function ReportDetailPage({ params }) {
  const session = await auth();
  if (!session) return redirect("/");

  let report = null;
  try {
    report = await safeFetchJSON(`${API_BASE}/api/reports/${params.id}/`, session.accessToken);
  } catch (e) {
    return <Card><Title level={4}>Report not found</Title><Text type="secondary">{String(e)}</Text></Card>;
  }

  const cfg = report?.config || {};
  const template = cfg.template ?? "users_overview";
  const type = report?.type ?? "Users";

  // Reaproveita o mesmo builder, mas já com filtros vindos da config (apenas leitura).
  // Para “somente visualização”, poderíamos travar botões (fica a seu critério).
  return <ReportBuilderServer searchParams={{ template, type }} />;
}
