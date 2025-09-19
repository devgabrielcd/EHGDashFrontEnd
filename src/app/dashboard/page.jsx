// src/app/dashboard/page.jsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

import DashEmployee from "@/components/DashRole/dashemployee/DashEmployee";
import DashCustomer from "@/components/DashRole/dashcustomer/DashCustomer";
import DashAdmin from "@/components/DashRole/dashadmin/DashAdmin"; // <- default import, ok

export const dynamic = "force-dynamic";

export default async function Dashboard(props) {
  const session = await auth();
  if (!session) redirect("/");

  const user = session.user;
  if (!user?.details) {
    return <div>Loading user details...</div>;
  }

  const sp = (await props?.searchParams) ?? props?.searchParams ?? {};
  const pick = (key, deflt) => {
    const v = sp?.[key];
    if (v === undefined) return deflt;
    return Array.isArray(v) ? (v[0] ?? deflt) : v;
  };

  // System Health
  const sysCompany = String(pick("company", "all"));
  const sysView = String(pick("view", "insurance"));

  // Revenue
  const revRaw = pick("rev_period", "12");
  const revParsed = Number.parseInt(revRaw, 10);
  const revPeriod = [3, 6, 9, 12].includes(revParsed) ? revParsed : 12;
  const revCompany = String(pick("rev_company", "all"));

  // Top Entities
  const teCompany = String(pick("te_company", "all"));

  // KPIs
  const kpiCompany = String(pick("kpi_company", "all"));

  // Recent Activity
  const actCompany = String(pick("act_company", "all"));

  switch ((user.details.user_role || "").toLowerCase()) {
    case "employee":
      return <DashEmployee user={user.details} />;

    case "customer":
      return <DashCustomer user={user.details} />;

    default:
      return (
        <DashAdmin
          sysCompany={sysCompany}
          sysView={sysView}
          revPeriod={revPeriod}
          revCompany={revCompany}
          teCompany={teCompany}
          kpiCompany={kpiCompany}
          actCompany={actCompany}
        />
      );
  }
}
