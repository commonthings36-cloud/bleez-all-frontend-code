import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState } from '@/types';

const initialState: UIState = {
  sidebarOpen: true,
  mobileSidebarOpen: false,
  activeNotificationsCount: 0,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleMobileSidebar: (state) => {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
    },
    setMobileSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileSidebarOpen = action.payload;
    },
    setNotificationsCount: (state, action: PayloadAction<number>) => {
      state.activeNotificationsCount = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileSidebar,
  setMobileSidebarOpen,
  setNotificationsCount,
} = uiSlice.actions;

export default uiSlice.reducer;
