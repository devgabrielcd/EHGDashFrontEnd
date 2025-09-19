// src/app/dashboard/page.jsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashEmployee from "@/components/DashRole/dashemployee/DashEmployee";
import DashCustomer from "@/components/DashRole/dashcustomer/DashCustomer";
import DashAdmin from "@/components/DashRole/dashadmin/DashAdmin";

// evita cache, importante quando os filtros mudam via URL
export const dynamic = "force-dynamic";

export default async function Dashboard(props) {
  const session = await auth();
  if (!session) redirect("/");

  const user = session.user;
  if (!user?.details) {
    return <div>Loading user details...</div>;
  }

  // Next 15 pode entregar searchParams como promessa; tratamos dos dois jeitos
  const sp = (await props?.searchParams) ?? props?.searchParams ?? {};

  // helper para pegar valores com fallback e tratar array
  const pick = (key, deflt) => {
    const v = sp?.[key];
    if (v === undefined) return deflt;
    return Array.isArray(v) ? (v[0] ?? deflt) : v;
  };

  // ---------- Filtros por componente ----------
  // System Health
  const sysCompany = String(pick("company", "all"));
  const sysView = String(pick("view", "insurance"));

  // Revenue Chart
  const revRaw = pick("rev_period", "12");
  const revParsed = Number.parseInt(revRaw, 10);
  const revPeriod = [3, 6, 9, 12].includes(revParsed) ? revParsed : 12;
  const revCompany = String(pick("rev_company", "all"));

  // Top Entities
  const teCompany = String(pick("te_company", "all"));

  // KPIs (total/h4h/qol) – opcional filtrar por empresa
  const kpiCompany = String(pick("kpi_company", "all"));

  switch ((user.details.user_role || "").toLowerCase()) {
    case "employee":
      return <DashEmployee user={user.details} />;

    case "customer":
      return <DashCustomer user={user.details} />;

    default:
      return (
        <DashAdmin
          // System Health
          sysCompany={sysCompany}
          sysView={sysView}
          // Revenue
          revPeriod={revPeriod}
          revCompany={revCompany}
          // Top Entities
          teCompany={teCompany}
          // KPIs
          kpiCompany={kpiCompany}
        />
      );
  }
}
