import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_DJANGO_API_URL || "http://localhost:8000";

// ⏱️ janelas de tempo
const ACCESS_LIFETIME_SECONDS = 5 * 60;          // access ~5 min
const SESSION_MAX_AGE_SECONDS = 24 * 60 * 60;    // sessão expira após 24h SEM USO
const UPDATE_AGE_SECONDS = 5 * 60;               // renova “carimbo” a cada 5 min de atividade
const EXP_LEEWAY_SECONDS = 10;                   // leve folga pra evitar bater no limite

// --- Mutex global para evitar corrida de refresh ---
let refreshPromise = null;

/**
 * Faz o refresh de forma serializada:
 * - Se já existe um refresh em andamento, aguarda o mesmo (evita 401 por rotação).
 * - Se o backend retornar refresh novo, substitui.
 */
async function doRefreshOnce(currentRefreshToken) {
  try {
    const resp = await axios.post(`${API_BASE}/auth/token/refresh/`, {
      refresh: currentRefreshToken,
    });

    const newAccess = resp?.data?.access;
    const newRefresh = resp?.data?.refresh; // com ROTATE_REFRESH_TOKENS pode vir

    if (!newAccess) throw new Error("No access in refresh response");

    return {
      accessToken: newAccess,
      refreshToken: newRefresh || currentRefreshToken,
      expires: Math.floor(Date.now() / 1000) + ACCESS_LIFETIME_SECONDS,
    };
  } catch (err) {
    // 401 aqui normalmente significa refresh já rotacionado/blacklist/expirado
    return { accessToken: undefined, refreshToken: undefined, expires: 0, error: "RefreshAccessTokenError" };
  }
}

async function refreshAccessToken(token) {
  // Se já tem refresh em andamento, aguarda o mesmo
  if (refreshPromise) {
    const r = await refreshPromise;
    return { ...token, ...r };
  }

  // Inicia um refresh "único"
  refreshPromise = doRefreshOnce(token.refreshToken);
  try {
    const r = await refreshPromise;
    return { ...token, ...r };
  } finally {
    refreshPromise = null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: { username: {}, password: {} },
      authorize: async (credentials) => {
        try {
          const authResponse = await axios.post(`${API_BASE}/auth/token/`, {
            username: credentials.username,
            password: credentials.password,
          });

          const { access, refresh, id } = authResponse.data || {};
          if (!access || !refresh) throw new Error("Invalid credentials");

          return {
            id,
            accessToken: access,
            refreshToken: refresh,
            expires: Math.floor(Date.now() / 1000) + ACCESS_LIFETIME_SECONDS,
            userDetailsFetched: false,
          };
        } catch (error) {
          const msg = error?.response?.data?.detail || "Authentication failed";
          throw new Error(msg);
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,   // 24h sem uso
    updateAge: UPDATE_AGE_SECONDS,     // renova a cada 5 min de atividade
  },

  jwt: {
    maxAge: SESSION_MAX_AGE_SECONDS,
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Login inicial
      if (user) token = { ...token, ...user };

      // Atualizações manuais preservando flags
      if (trigger === "update" && session) {
        token.userDetailsFetched = session.userDetailsFetched ?? token.userDetailsFetched;
      }

      // Se refresh anterior falhou, mantém erro para UI redirecionar
      if (token.error === "RefreshAccessTokenError") return token;

      const now = Math.floor(Date.now() / 1000);

      // Só tenta refresh quando realmente estiver “quase” expirado (com leeway)
      if (typeof token.expires === "number" && now >= (token.expires - EXP_LEEWAY_SECONDS)) {
        return await refreshAccessToken(token);
      }

      return token;
    },

    async session({ session, token }) {
      session.user = { id: token.id };
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;

      if (!token.userDetailsFetched && token.accessToken && !token.error && token.id != null) {
        try {
          const userDetailsResponse = await axios.get(
            `${API_BASE}/api/detail-user/${token.id}/`,
            { headers: { Authorization: `Bearer ${token.accessToken}` } }
          );
                console.log('Dados recebidos da API detail-user:', userDetailsResponse.data);

          session.user.details = userDetailsResponse.data.user || {};
          token.userDetailsFetched = true;
        } catch {
          session.user.details = {};
          session.error = session.error ?? "Failed to fetch user details";
        }
      } else {
        session.user.details = session.user.details ?? {};
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
});
