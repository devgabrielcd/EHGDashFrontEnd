import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ReportBuilderServer from "@/components/pages/reports/builder/ReportBuilderServer";

export default async function BuilderPage({ searchParams }) {
  const session = await auth();
  if (!session) return redirect("/");

  return (
    <main>
      <ReportBuilderServer searchParams={searchParams} />
    </main>
  );
}
