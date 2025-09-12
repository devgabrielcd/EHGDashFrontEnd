// src/app/dashboard/reports/users-overview/page.jsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UsersReportServer from "@/components/pages/reports/users/UsersReportServer";

export default async function UsersOverviewPage({ searchParams }) {
  const session = await auth();
  if (!session) return redirect("/");

  const months   = Number(searchParams?.months ?? 6);   // padrão 6
  const company  = searchParams?.company ?? "all";      // opcional
  return (
    <main>
      <UsersReportServer months={months} company={company} />
    </main>
  );
}
