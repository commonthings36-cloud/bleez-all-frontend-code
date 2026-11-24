import React, { useEffect } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { useAppSelector } from '@/store/hooks';
import { apiClient } from '@/services/apiClient';

const SIDEBAR_WIDTH = 300;
const COLLAPSED_WIDTH = 84;

export const AdminLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarOpen } = useAppSelector((state) => state.ui);

  // Auto-capture & sync admin / web user current location
  useEffect(() => {
    const syncIpLocation = async () => {
      try {
        const res = await apiClient.get('/emergency/detect-location');
        const data = res.data;
        if (data && (data.city || data.country || data.lat)) {
          await apiClient.post('/user/location', {
            latitude: typeof data.lat === 'number' ? data.lat : undefined,
            longitude: typeof data.lon === 'number' ? data.lon : undefined,
            city: data.city,
            region: data.regionName || data.region,
            country: data.country,
            country_code: data.countryCode,
            trigger_event: 'WEB_LOGIN',
            platform: 'WEB_APP',
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.debug('IP geolocation auto-sync skipped:', err);
      }
    };

    const syncGpsLocation = () => {
      if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              await apiClient.post('/user/location', {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                trigger_event: 'APP_RESUME',
                platform: 'WEB_APP',
                timestamp: new Date().toISOString(),
              });
            } catch (e) {
              console.debug('Failed to sync browser GPS location:', e);
            }
          },
          () => {
            // Permission denied or dismissed; IP sync already secured location
          },
          { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
        );
      }
    };

    // 1. Immediately sync via IP so location appears right away
    syncIpLocation();

    // 2. Request browser GPS for high-accuracy coordinates
    syncGpsLocation();

    // 3. Auto-sync on window focus / tab unminimizing (e.g. after flight or travel)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncGpsLocation();
        syncIpLocation();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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
