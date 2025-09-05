"use client";
import { create } from "zustand";

export const useSidebarUI = create((set) => ({
  collapsed: true,
  setCollapsed: (v) => set({ collapsed: v }),
  toggle: () => set((s) => ({ collapsed: !s.collapsed })),
}));
