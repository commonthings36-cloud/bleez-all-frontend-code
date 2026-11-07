import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Box,
  Stack,
  Divider,
  Popover,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleThemeMode } from '@/store/slices/themeSlice';
import { toggleMobileSidebar, setNotificationsCount } from '@/store/slices/uiSlice';
import { logout } from '@/store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/services/apiClient';

export const TopNav: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { mode } = useAppSelector((state) => state.theme);
  const { user } = useAppSelector((state) => state.auth);
  const { activeNotificationsCount } = useAppSelector((state) => state.ui);

  const [anchorElProfile, setAnchorElProfile] = useState<null | HTMLElement>(null);
  const [anchorElNotif, setAnchorElNotif] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  React.useEffect(() => {
    Promise.allSettled([
      apiClient.get('/emergency/panic-events'),
      apiClient.get('/alerts/all'),
    ]).then(([panicRes, alertsRes]) => {
      const panicNotifications =
        panicRes.status === 'fulfilled' && Array.isArray(panicRes.value.data)
          ? panicRes.value.data.map((ev: any) => ({
              id: ev.id,
              title: `SOS Alert: ${ev.senderName || 'Traveler'}`,
              description: `${ev.note || 'Emergency distress signal'} (${ev.recipientCount ?? 0} email(s) sent)`,
              country: ev.locationLabel || (ev.latitude != null && ev.longitude != null ? `${ev.latitude}, ${ev.longitude}` : undefined),
              severity: 'HIGH',
              type: 'emergency',
            }))
          : [];

      const advisoryNotifications =
        alertsRes.status === 'fulfilled'
          ? Array.isArray(alertsRes.value.data)
            ? alertsRes.value.data
            : alertsRes.value.data?.alerts || []
          : [];

      const combined = [...panicNotifications, ...advisoryNotifications];
      setNotifications(combined);
      dispatch(setNotificationsCount(combined.length));
    });
  }, [dispatch]);

  const handleOpenProfile = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElProfile(event.currentTarget);
  };
  const handleCloseProfile = () => setAnchorElProfile(null);

  const handleOpenNotif = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNotif(event.currentTarget);
  };
  const handleCloseNotif = () => setAnchorElNotif(null);

  const handleLogout = () => {
    handleCloseProfile();
    dispatch(logout());
    navigate('/auth/login');
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
        {/* Mobile Menu Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => dispatch(toggleMobileSidebar())}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Right Controls */}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {/* Light/Dark Mode Switcher */}
          <IconButton onClick={() => dispatch(toggleThemeMode())} color="inherit">
            {mode === 'dark' ? (
              <LightModeIcon sx={{ color: '#FBBF24' }} />
            ) : (
              <DarkModeIcon sx={{ color: '#475569' }} />
            )}
          </IconButton>

          {/* Notification Menu */}
          <IconButton color="inherit" onClick={handleOpenNotif}>
            <Badge badgeContent={activeNotificationsCount} color="error">
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>

          <Popover
            open={Boolean(anchorElNotif)}
            anchorEl={anchorElNotif}
            onClose={handleCloseNotif}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { width: 340, p: 0, mt: 1.5 } }}
          >
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 700 }}>
                System Notifications
              </Typography>
            </Box>
            <List disablePadding>
              {notifications.length === 0 ? (
                <ListItem sx={{ py: 2 }}>
                  <ListItemText
                    primary={
                      <Typography variant="body2" color="text.secondary" align="center">
                        No active notifications
                      </Typography>
                    }
                  />
                </ListItem>
              ) : (
                notifications.slice(0, 5).map((n, idx) => (
                  <React.Fragment key={n.id || idx}>
                    <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: n.severity === 'HIGH' || n.type === 'emergency' ? 'error.main' : 'warning.main',
                            width: 36,
                            height: 36,
                          }}
                        >
                          <WarningAmberIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {n.title || n.type || 'System Alert'}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary" display="block">
                            {n.description || n.message || ''}
                            {n.country && (
                              <Typography variant="caption" display="block" color="primary" sx={{ mt: 0.5 }}>
                                {n.country}
                              </Typography>
                            )}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))
              )}
            </List>
          </Popover>

          <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1.5 }} />

          {/* Profile Popover */}
          <Box
            onClick={handleOpenProfile}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              p: 0.5,
              borderRadius: '12px',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Avatar
              src={user?.avatarUrl}
              alt={user?.firstName}
              sx={{ width: 36, height: 36, border: `2px solid ${theme.palette.primary.main}` }}
            />
            <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                {user?.role}
              </Typography>
            </Box>
          </Box>

          <Menu
            anchorEl={anchorElProfile}
            open={Boolean(anchorElProfile)}
            onClose={handleCloseProfile}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { width: 220, mt: 1.5 } }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { handleCloseProfile(); navigate('/settings'); }}>
              <PersonOutlineIcon sx={{ mr: 1.5, fontSize: 20 }} /> My Profile
            </MenuItem>
            <MenuItem onClick={() => { handleCloseProfile(); navigate('/settings'); }}>
              <SettingsOutlinedIcon sx={{ mr: 1.5, fontSize: 20 }} /> Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} /> Sign Out
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
