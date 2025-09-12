import { redirect } from "next/navigation";
import { auth } from "@/auth";

import DashboardProviders from "@/components/providers/DashboardProviders"; // CLIENT
import SiderClient from "@/components/Sidebar/SiderClient";                 // CLIENT
import Navbar from "@/components/navbar/Navbar";                          // CLIENT
import AppFooter from "@/components/AppFooter/AppFooter";
import Loader from "@/components/Loader/Loader";

async function fetchSidebarItems(accessToken) {
  try {
    const base = process.env.NEXT_PUBLIC_DJANGO_API_URL || "http://localhost:8000";
    const res = await fetch(`${base}/api/menu/sidebar/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.items ?? [];
  } catch {
    return [];
  }
}

export default async function DashboardLayout({ children }) {
  // ✅ SSR da sessão
  const session = await auth();
  if (!session?.accessToken || session?.error === "RefreshAccessTokenError") {
    redirect("/");
  }

  // ✅ SSR do menu (evita flicker)
  const initialSidebarItems = await fetchSidebarItems(session.accessToken);

  return (
    <Loader>
    <DashboardProviders>
      {/* Contêiner raiz (server) */}
      <div style={{ minHeight: "100vh", background: "var(--bg-layout)" }}>
        {/* Sidebar fixa (client) */}
        <SiderClient initialItems={initialSidebarItems} />

        {/* Main (empurrado pela sidebar via CSS var) */}
        <div
          style={{
            marginLeft: "var(--sidebar-w, 80px)",
            transition: "margin-left .2s",
            background: "var(--bg-layout)",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Navbar (client) */}
          <Navbar brand="Dashboard" />

          {/* Conteúdo */}
          <main
            style={{
              padding: 24,
              background: "var(--bg-layout)",
              flex: 1,
              minHeight: 0,
            }}
          >
            {children}
          </main>

          {/* Rodapé */}
            <AppFooter style={{ textAlign: "center", padding: "12px 0" }}>
              EHGCorp by 12Peak
            </AppFooter>
        </div>
      </div>
    </DashboardProviders>
    </Loader>
  );
}
