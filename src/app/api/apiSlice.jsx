import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { useSession } from 'next-auth/react'

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:8000',
    credentials: 'include',
    prepareHeaders: (headers) => {
        const { data: session } = useSession();  // Obtém a sessão do NextAuth
        
        if (session && session.accessToken) {
            headers.set("authorization", `Bearer ${session.accessToken}`);
        }
        return headers;
    }
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result?.error?.originalStatus === 403) {
        console.log('sending refresh token');
        // Aqui você pode adicionar a lógica para fazer o refresh do token se necessário
        const refreshResult = await baseQuery('/api/token/refresh', api, extraOptions);

        if (refreshResult?.data) {
result = await baseQuery(args, api, extraOptions);
        } else {
       }
    }

    return result;
}

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    endpoints: builder => ({
        getProfile: builder.query({
            query: () => '/profile',
        }),
    })
})
