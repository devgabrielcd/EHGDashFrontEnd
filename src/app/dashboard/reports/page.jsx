import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ReportsPageServer from "@/components/pages/reports/ReportsPageServer";

export default async function ReportsHub({ searchParams }) {
  const session = await auth();
  if (!session) return redirect("/");

  return (
    <main>
      <ReportsPageServer searchParams={searchParams} />
    </main>
  );
}
