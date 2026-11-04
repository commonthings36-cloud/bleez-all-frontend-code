import { PaletteOptions } from '@mui/material/styles';

export const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#7C3AED', // Violet 600
    light: '#A78BFA',
    dark: '#5B21B6',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#0D9488', // Emerald Teal
    light: '#2DD4BF',
    dark: '#0F766E',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#0284C7',
    light: '#38BDF8',
    dark: '#0369A1',
  },
  success: {
    main: '#10B981',
    light: '#34D399',
    dark: '#059669',
  },
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
  },
  error: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
  },
  background: {
    default: '#F7F5FF',
    paper: 'rgba(255, 255, 255, 0.85)',
  },
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    disabled: '#94A3B8',
  },
  divider: 'rgba(226, 232, 240, 0.8)',
};

export const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: '#8B5CF6', // Electric Violet
    light: '#C4B5FD',
    dark: '#6D28D9',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#14B8A6', // Teal
    light: '#5EEAD4',
    dark: '#0F766E',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#38BDF8',
    light: '#7DD3FC',
    dark: '#0284C7',
  },
  success: {
    main: '#34D399',
    light: '#6EE7B7',
    dark: '#059669',
  },
  warning: {
    main: '#FBBF24',
    light: '#FDE047',
    dark: '#D97706',
  },
  error: {
    main: '#F87171',
    light: '#FCA5A5',
    dark: '#DC2626',
  },
  background: {
    default: '#0B0F19',
    paper: 'rgba(17, 24, 39, 0.75)',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    disabled: '#64748B',
  },
  divider: 'rgba(51, 65, 85, 0.6)',
};
