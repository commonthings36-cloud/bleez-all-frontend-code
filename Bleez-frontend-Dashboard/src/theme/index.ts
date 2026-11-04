import { createTheme, responsiveFontSizes, Theme } from '@mui/material/styles';
import { lightPalette, darkPalette } from './palette';
import { customComponents } from './components';

export const createAppTheme = (mode: 'light' | 'dark'): Theme => {
  const palette = mode === 'dark' ? darkPalette : lightPalette;

  let theme = createTheme({
    palette,
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      h1: { fontWeight: 800, fontSize: '2.25rem' },
      h2: { fontWeight: 700, fontSize: '1.875rem' },
      h3: { fontWeight: 700, fontSize: '1.5rem' },
      h4: { fontWeight: 600, fontSize: '1.25rem' },
      h5: { fontWeight: 600, fontSize: '1.125rem' },
      h6: { fontWeight: 600, fontSize: '1rem' },
      subtitle1: { fontWeight: 500, fontSize: '0.875rem' },
      subtitle2: { fontWeight: 500, fontSize: '0.75rem' },
      body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
      body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
      button: { fontWeight: 600, fontSize: '0.875rem' },
    },
    shape: {
      borderRadius: 16,
    },
    components: customComponents,
  });

  return responsiveFontSizes(theme);
};
