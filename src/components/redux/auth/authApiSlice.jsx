import { apiSlice } from "@/app/api/apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        login: builder.mutation({
            query: credentials => ({
                url: '/api/token/',
                method: 'POST',
                body: { username: credentials.user, password: credentials.pwd } // Certifique-se de passar como 'username' e 'password'
            })
        }),
        refreshToken: builder.mutation({
            query: (refreshToken) => ({
                url: '/api/token/refresh/', // Endpoint para refresh token
                method: 'POST',
                body: { refresh: refreshToken },
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useRefreshTokenMutation,
} = authApiSlice