// util simples para chamadas ao backend
export async function callAPI(path, payload) {
  try {
    const base =
      process.env.NEXT_PUBLIC_DJANGO_API_URL || "http://localhost:8000";
    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload || {}),
    });
    if (!res.ok) throw new Error("Request failed");
    return await res.json().catch(() => ({}));
  } catch (e) {
    console.error(e);
    throw e;
  }
}
