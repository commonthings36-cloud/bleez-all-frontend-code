import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ThemeState } from '@/types';

const initialState: ThemeState = {
  mode: 'dark', // Default modern dark theme
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleThemeMode: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
    },
    setThemeMode: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.mode = action.payload;
    },
  },
});

export const { toggleThemeMode, setThemeMode } = themeSlice.actions;
export default themeSlice.reducer;
