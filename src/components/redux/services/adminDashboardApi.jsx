import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const adminDashboardApi = createApi({
  reducerPath: 'adminDashboardApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '',           // chama as rotas do PRÓPRIO Next
    credentials: 'include',
  }),
  endpoints: (builder) => ({
    getAdminKpis: builder.query({
      query: () => '/api/dashboard/admin/kpis',
    }),
    getRevenueSeries: builder.query({
      query: ({ range = '12m' } = {}) => `/api/dashboard/admin/revenue?range=${range}`,
    }),
    getAuditLog: builder.query({
      query: ({ limit = 10 } = {}) => `/api/dashboard/admin/audit-log?limit=${limit}`,
    }),
    getHealth: builder.query({
      query: () => '/api/dashboard/admin/health',
    }),
    getTopEntities: builder.query({
      query: ({ by = 'revenue' } = {}) => `/api/dashboard/admin/top-entities?by=${by}`,
    }),
  }),
});

export const {
  useGetAdminKpisQuery,
  useGetRevenueSeriesQuery,
  useGetAuditLogQuery,
  useGetHealthQuery,
  useGetTopEntitiesQuery,
} = adminDashboardApi;
