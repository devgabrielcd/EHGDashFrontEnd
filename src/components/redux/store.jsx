import { configureStore } from "@reduxjs/toolkit";

// --- seus slices existentes ---
import authReducer from '@/components/redux/auth/authSlice';
import productsReducer from '@/components/redux/products/productsSlice';
import PagesSlice from '@/components/redux/pages/PagesSlice';
import { apiSlice } from '@/app/api/apiSlice'; // se você usa um apiSlice global

import { menuApi } from "@/components/redux/services/menuApi";
import sidebarReducer from '@/components/redux/ui/sidebarSlice';

import selectedMenuReducer from '@/components/redux/sidebar/selectedMenuSlice';

export const store = configureStore({
  reducer: {
    // RTK Query (seu apiSlice global, se existir)
    [apiSlice.reducerPath]: apiSlice.reducer,

    // RTK Query específico do menu
    [menuApi.reducerPath]: menuApi.reducer,

    // seus reducers existentes
    auth: authReducer,
    pages: PagesSlice,
    products: productsReducer,

    // controle local da sidebar antiga (se você ainda usa em algum lugar)
    selectedMenu: selectedMenuReducer,

    // NOVO: estado do dual sidebar (overlay/pin/activeSection)
    sidebar: sidebarReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      // middleware do seu apiSlice global (se existir)
      .concat(apiSlice.middleware)
      // middleware do menuApi
      .concat(menuApi.middleware),
  devTools: true,
});

