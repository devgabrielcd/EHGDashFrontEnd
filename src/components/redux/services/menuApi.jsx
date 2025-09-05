import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const menuApi = createApi({
  reducerPath: 'menuApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '',
    credentials: 'include',
  }),
  keepUnusedDataFor: 3600, // 1h em cache na store
  endpoints: (builder) => ({
    getSidebar: builder.query({
      query: () => '/api/menu/sidebar/',
    }),
  }),
});

export const { useGetSidebarQuery } = menuApi;
