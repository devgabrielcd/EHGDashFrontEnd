import { redirect } from "next/navigation";
import { auth } from "@/auth";

import Providers from "@/components/Themes/Providers";
import DashboardProviders from "@/components/providers/DashboardProviders";
import AppHeader from "@/components/AppHeader/AppHeader";

import { Layout } from "antd";
import Sider from "antd/es/layout/Sider";
import SiderClient from "@/components/Sidebar/SiderClient";
import AppFooter from "@/components/AppFooter/AppFooter";
import { Content } from "antd/es/layout/layout";

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
  const session = await auth();
  if (!session?.accessToken || session?.error === "RefreshAccessTokenError") {
    redirect("/");
  }

  const initialSidebarItems = await fetchSidebarItems(session.accessToken);

  return (
    <Providers>
      <DashboardProviders>
        <Layout>
          <AppHeader />

          {/* Sidebar ocupa toda a altura da janela e começa no topo */}
          <Sider
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              height: "100vh",
              zIndex: 999, // abaixo do header (1000), mas acima do conteúdo
            }}
            width={80}
          >
            <SiderClient initialItems={initialSidebarItems} />
          </Sider>

          {/* Área principal é empurrada pela sidebar */}
          <Layout
            style={{
              marginLeft: "var(--sidebar-w, 200px)",
              transition: "margin-left .2s ease",
              background: "var(--bg-layout)",
              minHeight: "100vh",
              paddingTop: 64, // evita que o conteúdo suba por baixo do header
            }}
          >
            <Content style={{ padding: 16 }}>
              {children}
            </Content>

            <AppFooter style={{ textAlign: "center", padding: "12px 0" }}>
              EHGCorp by 12Peak
            </AppFooter>
          </Layout>
        </Layout>
      </DashboardProviders>
    </Providers>
  );
}
