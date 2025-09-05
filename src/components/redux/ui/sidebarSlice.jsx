import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  leftRailWidth: 56,   // px
  overlayWidth: 288,   // px
  overlayOpen: false,
  overlayPinned: false,
  activeSection: null, // slug/id do item selecionado
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    openOverlay: (state, action) => {
      state.activeSection = action.payload;
      state.overlayOpen = true;
    },
    closeOverlay: (state) => {
      state.overlayOpen = false;
      if (!state.overlayPinned) state.activeSection = null;
    },
    togglePin: (state) => {
      state.overlayPinned = !state.overlayPinned;
      if (!state.overlayPinned && !state.overlayOpen) {
        state.activeSection = null;
      }
    },
    setActiveSection: (state, action) => {
      state.activeSection = action.payload;
    },
  },
});

export const { openOverlay, closeOverlay, togglePin, setActiveSection } = sidebarSlice.actions;
export default sidebarSlice.reducer;
