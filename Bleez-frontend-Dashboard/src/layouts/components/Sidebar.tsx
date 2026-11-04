import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined';
import BrandingWatermarkOutlinedIcon from '@mui/icons-material/BrandingWatermarkOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';

import { NAVIGATION_CONFIG } from '@/constants/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar, setMobileSidebarOpen } from '@/store/slices/uiSlice';

const ICON_MAP: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlinedIcon />,
  PeopleOutlined: <PeopleOutlinedIcon />,
  AutoAwesomeOutlined: <AutoAwesomeOutlinedIcon />,
  CampaignOutlined: <CampaignOutlinedIcon />,
  PublicOutlined: <PublicOutlinedIcon />,
  ShieldOutlined: <ShieldOutlinedIcon />,
  WarningAmberOutlined: <WarningAmberOutlinedIcon />,
  FlightTakeoffOutlined: <FlightTakeoffOutlinedIcon />,
  CreditCardOutlined: <CreditCardOutlinedIcon />,
  AccountBalanceWalletOutlined: <AccountBalanceWalletOutlinedIcon />,
  ForumOutlined: <ForumOutlinedIcon />,
  NotificationsNoneOutlined: <NotificationsNoneOutlinedIcon />,
  AssessmentOutlined: <AssessmentOutlinedIcon />,
  DnsOutlined: <DnsOutlinedIcon />,
  ScheduleOutlined: <ScheduleOutlinedIcon />,
  ReceiptLongOutlined: <ReceiptLongOutlinedIcon />,
  ArticleOutlined: <ArticleOutlinedIcon />,
  SettingsOutlined: <SettingsOutlinedIcon />,
  WorkspacePremiumOutlined: <WorkspacePremiumOutlinedIcon />,
  CardMembershipOutlined: <CardMembershipOutlinedIcon />,
  BrandingWatermarkOutlined: <BrandingWatermarkOutlinedIcon />,
  BusinessCenterOutlined: <BusinessCenterOutlinedIcon />,
  MonitorHeartOutlined: <MonitorHeartOutlinedIcon />,
  AnalyticsOutlined: <AnalyticsOutlinedIcon />,
  BusinessOutlined: <BusinessOutlinedIcon />,
};

const SIDEBAR_WIDTH = 280;
const COLLAPSED_WIDTH = 84;

export const Sidebar: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { sidebarOpen, mobileSidebarOpen } = useAppSelector((state) => state.ui);

  const drawerWidth = sidebarOpen ? SIDEBAR_WIDTH : COLLAPSED_WIDTH;

  const handleNavClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      dispatch(setMobileSidebarOpen(false));
    }
  };

  const renderContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Brand Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={sidebarOpen ? 'space-between' : 'center'}
        sx={{ px: 2.5, py: 2.5, minHeight: 70 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              boxShadow: '0 6px 16px -4px rgba(124, 58, 237, 0.5)',
              flexShrink: 0,
            }}
          >
            <FlightTakeoffIcon />
          </Box>
          {sidebarOpen && (
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Bleez.AI
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Enterprise SaaS
              </Typography>
            </Box>
          )}
        </Stack>

        {!isMobile && sidebarOpen && (
          <IconButton onClick={() => dispatch(toggleSidebar())} size="small">
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Stack>

      <Divider sx={{ mx: 2, borderColor: 'divider' }} />

      {/* Navigation Links */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2, py: 2 }}>
        <List disablePadding>
          {NAVIGATION_CONFIG.map((item, index) => {
            const isActive = location.pathname.startsWith(item.path);
            const startsSection = item.section && item.section !== NAVIGATION_CONFIG[index - 1]?.section;

            return (
              <React.Fragment key={item.id}>
              {startsSection && sidebarOpen && (
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ display: 'block', px: 1.5, pt: index === 0 ? 0 : 2, pb: 0.5, fontWeight: 700, letterSpacing: '0.08em' }}
                >
                  {item.section}
                </Typography>
              )}
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <Tooltip title={!sidebarOpen ? item.title : ''} placement="right" arrow>
                  <ListItemButton
                    onClick={() => handleNavClick(item.path)}
                    selected={isActive}
                    sx={{
                      minHeight: 48,
                      borderRadius: '12px',
                      justifyContent: sidebarOpen ? 'initial' : 'center',
                      px: 2,
                      py: 1,
                      backgroundColor: isActive
                        ? theme.palette.mode === 'dark'
                          ? 'rgba(124, 58, 237, 0.18)'
                          : 'rgba(124, 58, 237, 0.1)'
                        : 'transparent',
                      color: isActive ? 'primary.main' : 'text.secondary',
                      '&:hover': {
                        backgroundColor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: sidebarOpen ? 2 : 'auto',
                        justifyContent: 'center',
                        color: isActive ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      {ICON_MAP[item.icon] || <DashboardOutlinedIcon />}
                    </ListItemIcon>

                    {sidebarOpen && (
                      <ListItemText
                        primary={item.title}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: isActive ? 700 : 500,
                          noWrap: true,
                        }}
                      />
                    )}

                    {sidebarOpen && item.badge && (
                      <Chip
                        label={item.badge}
                        size="small"
                        color={item.id === 'emergency' ? 'error' : 'primary'}
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
              </React.Fragment>
            );
          })}
        </List>
      </Box>

      {/* Collapse Toggle Footer for Desktop */}
      {!isMobile && !sidebarOpen && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <IconButton onClick={() => dispatch(toggleSidebar())} size="small">
            <ChevronRightIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );

  return isMobile ? (
    <Drawer
      anchor="left"
      open={mobileSidebarOpen}
      onClose={() => dispatch(setMobileSidebarOpen(false))}
      PaperProps={{ sx: { width: SIDEBAR_WIDTH } }}
    >
      {renderContent}
    </Drawer>
  ) : (
    <Drawer
      variant="permanent"
      open={sidebarOpen}
      PaperProps={{
        sx: {
          width: drawerWidth,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {renderContent}
    </Drawer>
  );
};
