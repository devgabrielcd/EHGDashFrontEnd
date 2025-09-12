import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import axios from "axios";

async function refreshAccessToken(token) {
  try {
    const response = await axios.post("http://localhost:8000/auth/token/refresh/", {
      refresh: token.refreshToken,
    });

    return {
      ...token,
      accessToken: response.data.access,
      expires: Math.floor(Date.now() / 1000) + 300, // 5 minutos
    };
  } catch (error) {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          // Login inicial
          const authResponse = await axios.post("http://localhost:8000/auth/token/", {
            username: credentials.username,
            password: credentials.password,
          });

          if (authResponse.data && authResponse.data.access && authResponse.data.refresh) {
            return {
              id: authResponse.data.id,
              accessToken: authResponse.data.access,
              refreshToken: authResponse.data.refresh,
              expires: Math.floor(Date.now() / 1000) + 300,
            };
          } else {
            throw new Error("Invalid credentials");
          }
        } catch (error) {
          throw new Error(error.response?.data?.detail || "Authentication failed");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token = { ...token, ...user };
      }

      if (Date.now() / 1000 >= token.expires - 1) {
        return refreshAccessToken(token);
      }

      return token;
    },

    async session({ session, token }) {
      session.user = { id: token.id };
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;

      // Segunda requisição para buscar os detalhes do usuário
      if (!session.user.details && token.accessToken) {
        try {
          const userDetailsResponse = await axios.get(
            `http://localhost:8000/api/detail-user/${token.id}/`,
            {
              headers: {
                Authorization: `Bearer ${token.accessToken}`,
              },
            }
          );

          session.user.details = userDetailsResponse.data.user;
        } catch (error) {
          session.user.details = null;
          session.error = "Failed to fetch user details";
        }
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },

  session: {
    strategy: "jwt",
  },
});
