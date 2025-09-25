export function apiBase() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, "");
}

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(^|; )" + encodeURIComponent(name) + "=([^;]*)"));
  return m ? decodeURIComponent(m[2]) : null;
}

export function authHeaders() {
  const h = { Accept: "application/json" };

  // 1) Prioriza var global (se existir)
  if (typeof window !== "undefined" && window.__ACCESS_TOKEN__) {
    h.Authorization = `Bearer ${window.__ACCESS_TOKEN__}`;
    return h;
  }

  // 2) Cookie persistente após redirect
  const fromCookie =
    readCookie("dj_access") || readCookie("access") || readCookie("jwt") || readCookie("token");
  if (fromCookie) {
    h.Authorization = `Bearer ${fromCookie}`;
  }

  return h;
}
