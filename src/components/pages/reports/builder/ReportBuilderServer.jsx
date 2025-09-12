import { auth } from "@/auth";
import { API_BASE, safeFetchJSON } from "@/lib/api";
import ReportBuilderClient from "./ReportBuilderClient";

export default async function ReportBuilderServer({ searchParams }) {
  const session = await auth();

  const type = searchParams?.type ?? "Users";
  const template = searchParams?.template ?? "users_overview";

  // companies para o filtro
  let companies = [{ label: "All", value: "all" }];
  try {
    const list = await safeFetchJSON(`${API_BASE}/company/list/`, session?.accessToken);
    const opts = (Array.isArray(list) ? list : [])
      .filter((c) => c?.id && c?.name)
      .map((c) => ({ label: c.name, value: String(c.id) }));
    companies = [{ label: "All", value: "all" }, ...opts];
  } catch (e) {
    // segue sem companies
  }

  return (
    <ReportBuilderClient
      template={template}
      type={type}
      companies={companies}
      token={session?.accessToken || null}
    />
  );
}
