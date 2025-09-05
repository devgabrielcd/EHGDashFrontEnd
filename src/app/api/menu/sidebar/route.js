// Proxy: /api/menu/sidebar  ->  http://localhost:8000/api/menu/sidebar/
// Lê o accessToken da sessão do NextAuth v5 (auth()) e envia Authorization: Bearer

import { auth } from "@/auth"; // <- do seu auth v5

export const dynamic = "force-dynamic";

export async function GET() {
  const BACKEND = process.env.BACKEND_BASE_URL || "http://localhost:8000";
  const targetUrl = `${BACKEND}/api/menu/sidebar/`;

  try {
    const session = await auth(); // v5
    const access = session?.accessToken;

    if (!access) {
      // Sem token => não autenticado via NextAuth
      return Response.json({ detail: "Not authenticated" }, { status: 401 });
    }

    const resp = await fetch(targetUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${access}` },
    });

    // Retorna o corpo exatamente como o Django respondeu
    const text = await resp.text();
    return new Response(text, {
      status: resp.status,
      headers: {
        "content-type": resp.headers.get("content-type") || "application/json",
      },
    });
  } catch (err) {
    console.error("[/api/menu/sidebar] Proxy error:", err);
    return Response.json({ detail: "Proxy error", error: String(err) }, { status: 500 });
  }
}
