import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  valueCurrentPage: 0,
};

const PagesSlice = createSlice({
  name: "pages",
  initialState,
  reducers: {
    CurrentPage(state, action) {
      // console.log("stateee:", action);
      state.valueCurrentPage = action.payload;
    },
  },
});

export const { CurrentPage } = PagesSlice.actions;

export default PagesSlice.reducer;
