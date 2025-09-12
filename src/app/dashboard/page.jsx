import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashEmployee from "@/components/DashRole/dashemployee/DashEmployee";
import DashCustomer from "@/components/DashRole/dashcustomer/DashCustomer";
import DashAdmin from "@/components/DashRole/dashadmin/DashAdmin";

export default async function Dashboard({ searchParams }) {
  const session = await auth();
  if (!session) return redirect("/");

  const user = session.user;
  if (!user?.details) return <div>Loading user details...</div>;

  // ——— filtros independentes por componente ———
  const sysCompany = (searchParams?.company ?? "all").toString();       // System Health
  const sysView    = (searchParams?.view ?? "insurance").toString();    // System Health

  const revPeriod  = Number(searchParams?.rev_period ?? 12);            // Revenue Chart
  const teCompany  = (searchParams?.te_company ?? "all").toString();    // Top Entities

  switch (user.details.user_role) {
    case "employee":
      return <DashEmployee user={user.details} />;
    case "customer":
      return <DashCustomer user={user.details} />;
    default:
      return (
        <DashAdmin
          // passa apenas o que cada card precisa
          sysCompany={sysCompany}
          sysView={sysView}
          revPeriod={revPeriod}
          teCompany={teCompany}
        />
      );
  }
}
