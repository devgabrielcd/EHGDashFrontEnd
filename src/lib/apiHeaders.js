// src/lib/apiHeaders.js
export function apiBase() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, "");
}

/**
 * Monta headers de autenticação:
 * - Sempre manda Accept: application/json
 * - Se houver um access token disponível (ex.: injetado em window.__ACCESS_TOKEN__),
 *   envia Authorization: Bearer <token>
 */
export function authHeaders() {
  const h = { Accept: "application/json" };
  if (typeof window !== "undefined" && window.__ACCESS_TOKEN__) {
    h.Authorization = `Bearer ${window.__ACCESS_TOKEN__}`;
  }
  return h;
}
