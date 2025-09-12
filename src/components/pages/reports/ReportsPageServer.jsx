import { auth } from "@/auth";
import { API_BASE, safeFetchJSON } from "@/lib/api";
import ReportsPageClient from "./ReportsPageClient";

export default async function ReportsPageServer({ searchParams }) {
  const session = await auth();

  const q = searchParams?.q ?? "";
  const type = searchParams?.type ?? "";
  const from = searchParams?.from ?? "";
  const to = searchParams?.to ?? "";
  const page = Number(searchParams?.page ?? 1);
  const page_size = Number(searchParams?.page_size ?? 10);

  let stats = { total: 0, ready: 0, processing: 0, failed: 0 };
  let list = { results: [], count: 0, page, page_size };
  let types = [];

  try {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("page", String(page));
    params.set("page_size", String(page_size));

    const [statsJson, listJson, typesJson] = await Promise.all([
      safeFetchJSON(`${API_BASE}/api/reports/stats/?${params}`, session?.accessToken),
      safeFetchJSON(`${API_BASE}/api/reports/?${params}`, session?.accessToken),
      safeFetchJSON(`${API_BASE}/api/report-types/`, session?.accessToken),
    ]);

    stats = statsJson;
    list = listJson;
    types = typesJson; // [{label,value}]
  } catch (e) {
    // mantém página viva; client mostra o erro
    return <ReportsPageClient error={String(e)} stats={stats} list={list} types={types} />;
  }

  return <ReportsPageClient stats={stats} list={list} types={types} />;
}
