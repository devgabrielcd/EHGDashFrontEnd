import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedKey: null,
  openKeys: [],
};

const selectedMenuSlice = createSlice({
  name: 'selectedMenu',
  initialState,
  reducers: {
    setSelectedKey(state, action) {
      state.selectedKey = action.payload;
    },
    setOpenKeys(state, action) {
      state.openKeys = action.payload;
    },
    resetSidebar() {
      return initialState;
    },
  },
});

export const { setSelectedKey, setOpenKeys, resetSidebar } = selectedMenuSlice.actions;
export default selectedMenuSlice.reducer;
