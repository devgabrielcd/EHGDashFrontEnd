import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const menuApi = createApi({
  reducerPath: 'menuApi',
  baseQuery: fetchBaseQuery({
    // Opção A (com rewrite):
    baseUrl: '',
    // Opção B (direto no backend): baseUrl: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000',
    credentials: 'include', // envia cookie de sessão do Django
  }),
  endpoints: (builder) => ({
    getSidebar: builder.query({
      query: () => '/api/menu/sidebar/',
    }),
  }),
});

export const { useGetSidebarQuery } = menuApi;
