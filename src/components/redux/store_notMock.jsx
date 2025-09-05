import { configureStore } from "@reduxjs/toolkit";

// seus reducers existentes
import authReducer from '@/features/auth/authSlice';
import productsReducer from '@/features/products/productsSlice';
import PagesSlice from '@/features/pages/PagesSlice';
import { apiSlice } from '@/app/api/apiSlice';

// já existentes no projeto
import { menuApi } from '@/redux/services/menuApi';
import selectedMenuReducer from '@/redux/sidebar/selectedMenuSlice';

// NOVO: adminDashboardApi
import { adminDashboardApi } from '@/redux/services/adminDashboardApi';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [menuApi.reducerPath]: menuApi.reducer,
    [adminDashboardApi.reducerPath]: adminDashboardApi.reducer,

    auth: authReducer,
    pages: PagesSlice,
    products: productsReducer,
    selectedMenu: selectedMenuReducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(apiSlice.middleware, menuApi.middleware, adminDashboardApi.middleware),
  devTools: true,
});
