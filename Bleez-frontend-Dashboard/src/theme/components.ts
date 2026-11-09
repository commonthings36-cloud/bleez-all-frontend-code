import { Components, Theme } from '@mui/material/styles';

export const customComponents: Components<Theme> = {
  MuiCssBaseline: {
    styleOverrides: (theme) => ({
      '*': {
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
      },
      html: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        height: '100%',
        width: '100%',
      },
      body: {
        height: '100%',
        width: '100%',
        fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        overflowX: 'hidden',
      },
      '#root': {
        height: '100%',
        width: '100%',
      },
      /* Custom Scrollbars */
      '::-webkit-scrollbar': {
        width: '6px',
        height: '6px',
      },
      '::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '::-webkit-scrollbar-thumb': {
        background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
        borderRadius: '4px',
      },
      '::-webkit-scrollbar-thumb:hover': {
        background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: '16px',
        backgroundImage: 'none',
        backgroundColor: theme.palette.background.paper,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
            : '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      }),
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
        textTransform: 'none',
        fontWeight: 600,
        padding: '8px 20px',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 6px 20px -4px rgba(124, 58, 237, 0.4)',
        },
      },
      containedPrimary: {
        background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
        // Disabled keeps the gradient, so keep the label white (just softer) to stay readable.
        '&.Mui-disabled': {
          background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
          color: 'rgba(255, 255, 255, 0.9)',
          opacity: 0.55,
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundImage: 'none',
        borderRadius: '16px',
        backgroundColor: theme.palette.background.paper,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${theme.palette.divider}`,
      }),
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRight: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(11, 15, 25, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }),
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(11, 15, 25, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
        boxShadow: 'none',
      }),
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        fontWeight: 600,
      },
    },
  },
};
