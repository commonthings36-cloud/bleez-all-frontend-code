import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { useAppSelector } from '@/store/hooks';

const SIDEBAR_WIDTH = 300;
const COLLAPSED_WIDTH = 84;

export const AdminLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarOpen } = useAppSelector((state) => state.ui);

  const currentSidebarWidth = isMobile ? 0 : sidebarOpen ? SIDEBAR_WIDTH : COLLAPSED_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          ml: { md: `${currentSidebarWidth}px` },
          transition: theme.transitions.create(['margin-left', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {/* Sticky Top Header */}
        <TopNav />

        {/* Dynamic Page Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            backgroundColor: theme.palette.background.default,
            backgroundImage:
              theme.palette.mode === 'dark'
                ? 'radial-gradient(900px 420px at 85% -5%, rgba(124,58,237,.18), transparent 60%), radial-gradient(700px 400px at 0% 100%, rgba(99,102,241,.10), transparent 60%)'
                : 'radial-gradient(900px 420px at 85% -5%, rgba(167,139,250,.28), transparent 60%), radial-gradient(700px 400px at 0% 100%, rgba(129,140,248,.16), transparent 60%)',
            backgroundAttachment: 'fixed',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
