import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Collapse,
  Drawer,
  IconButton,
  Popover,
  Tooltip,
  Typography,
  Chip,
  alpha,
  keyframes,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import BrandingWatermarkOutlinedIcon from '@mui/icons-material/BrandingWatermarkOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';

import { SidebarArt } from '@/components/Illustrations';
import { NAVIGATION_CONFIG } from '@/constants/navigation';
import { NavItem } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar, setMobileSidebarOpen } from '@/store/slices/uiSlice';

export const SIDEBAR_WIDTH = 300;
const NAV_FONT_SIZE = '0.95rem';
const NAV_FONT_WEIGHT = 600;
export const COLLAPSED_WIDTH = 84;

const ICON_MAP: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlinedIcon />,
  PeopleOutlined: <PeopleOutlinedIcon />,
  AutoAwesomeOutlined: <AutoAwesomeOutlinedIcon />,
  CampaignOutlined: <CampaignOutlinedIcon />,
  PublicOutlined: <PublicOutlinedIcon />,
  ShieldOutlined: <ShieldOutlinedIcon />,
  WarningAmberOutlined: <WarningAmberOutlinedIcon />,
  FlightTakeoffOutlined: <FlightTakeoffOutlinedIcon />,
  TravelExploreOutlined: <TravelExploreOutlinedIcon />,
  CreditCardOutlined: <CreditCardOutlinedIcon />,
  AccountBalanceWalletOutlined: <AccountBalanceWalletOutlinedIcon />,
  ForumOutlined: <ForumOutlinedIcon />,
  NotificationsNoneOutlined: <NotificationsNoneOutlinedIcon />,
  AssessmentOutlined: <AssessmentOutlinedIcon />,
  ScheduleOutlined: <ScheduleOutlinedIcon />,
  ReceiptLongOutlined: <ReceiptLongOutlinedIcon />,
  ArticleOutlined: <ArticleOutlinedIcon />,
  SettingsOutlined: <SettingsOutlinedIcon />,
  WorkspacePremiumOutlined: <WorkspacePremiumOutlinedIcon />,
  BrandingWatermarkOutlined: <BrandingWatermarkOutlinedIcon />,
  MonitorHeartOutlined: <MonitorHeartOutlinedIcon />,
  AnalyticsOutlined: <AnalyticsOutlinedIcon />,
  BusinessOutlined: <BusinessOutlinedIcon />,
};

const SECTION_ICONS: Record<string, React.ReactNode> = {
  Overview: <DashboardOutlinedIcon />,
  Customers: <GroupsOutlinedIcon />,
  Revenue: <PaidOutlinedIcon />,
  Content: <ExploreOutlinedIcon />,
  Platform: <HubOutlinedIcon />,
};

interface Group {
  name: string;
  items: NavItem[];
}

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
`;

export const Sidebar: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';

  const { sidebarOpen, mobileSidebarOpen } = useAppSelector((state) => state.ui);
  // On mobile the drawer is always shown in full.
  const expanded = isMobile ? true : sidebarOpen;

  const groups: Group[] = useMemo(() => {
    const map = new Map<string, NavItem[]>();
    NAVIGATION_CONFIG.forEach((item) => {
      const key = item.section || 'Other';
      map.set(key, [...(map.get(key) || []), item]);
    });
    return Array.from(map, ([name, items]) => ({ name, items }));
  }, []);

  const isActivePath = (path: string) => location.pathname.startsWith(path);
  const activeGroup = groups.find((g) => g.items.some((i) => isActivePath(i.path)))?.name;

  // Accordion: only one section open at a time, so the sidebar never needs scrolling.
  const [openGroup, setOpenGroup] = useState<string | null>(activeGroup ?? null);
  useEffect(() => {
    if (activeGroup) setOpenGroup(activeGroup);
  }, [activeGroup]);

  // Flyout used when the sidebar is collapsed.
  const [flyout, setFlyout] = useState<{ el: HTMLElement; group: Group } | null>(null);

  const go = (path: string) => {
    navigate(path);
    setFlyout(null);
    if (isMobile) dispatch(setMobileSidebarOpen(false));
  };

  const accent = theme.palette.primary.main;
  const activeBg = alpha(accent, isDark ? 0.2 : 0.1);
  const hoverBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.04)';

  const renderItem = (item: NavItem, delay = 0) => {
    const active = isActivePath(item.path);
    return (
      <Box
        key={item.id}
        role="button"
        tabIndex={0}
        onClick={() => go(item.path)}
        onKeyDown={(e) => e.key === 'Enter' && go(item.path)}
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          height: 48,
          px: 1.75,
          borderRadius: '12px',
          cursor: 'pointer',
          color: active ? accent : 'text.secondary',
          bgcolor: active ? activeBg : 'transparent',
          animation: `${slideIn} 0.28s ${delay}ms both ease-out`,
          transition: 'background-color .2s, color .2s, transform .2s',
          '&:hover': { bgcolor: active ? activeBg : hoverBg, color: active ? accent : 'text.primary', transform: 'translateX(3px)' },
          '&::before': {
            content: '""',
            position: 'absolute',
            left: -8,
            top: '22%',
            bottom: '22%',
            width: 4,
            borderRadius: 4,
            bgcolor: accent,
            opacity: active ? 1 : 0,
            transform: active ? 'scaleY(1)' : 'scaleY(0.2)',
            transition: 'all .25s',
          },
          '& svg': { fontSize: 22 },
        }}
      >
        {ICON_MAP[item.icon] || <DashboardOutlinedIcon />}
        <Typography noWrap sx={{ fontSize: NAV_FONT_SIZE, fontWeight: NAV_FONT_WEIGHT, flexGrow: 1, color: 'inherit' }}>
          {item.title}
        </Typography>
        {item.badge && (
          <Chip label={item.badge} size="small" color={item.id === 'emergency' ? 'error' : 'primary'} sx={{ height: 20, fontSize: '0.7rem' }} />
        )}
      </Box>
    );
  };

  const brand = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: expanded ? 2.5 : 0, justifyContent: expanded ? 'flex-start' : 'center', height: 76, flexShrink: 0 }}>
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: '13px',
          background: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 55%, #6D28D9 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 8px 20px -6px rgba(124,58,237,.65)',
          flexShrink: 0,
          transition: 'transform .4s',
          '&:hover': { transform: 'rotate(-8deg) scale(1.06)' },
        }}
      >
        <FlightTakeoffIcon />
      </Box>
      {expanded && (
        <Box sx={{ overflow: 'hidden', minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', lineHeight: 1.15 }}>Bleez.AI</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Enterprise SaaS
          </Typography>
        </Box>
      )}
    </Box>
  );

  const nav = (
    <Box
      sx={{
        flexGrow: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        px: expanded ? 1.75 : 1.25,
        py: 1,
        '&::-webkit-scrollbar': { width: 0 },
      }}
    >
      {groups.map((group) => {
        const single = group.items.length === 1;
        const groupActive = group.items.some((i) => isActivePath(i.path));
        const open = openGroup === group.name;

        // ---- Collapsed rail: one icon per section ----
        if (!expanded) {
          const target = single ? group.items[0] : null;
          return (
            <Tooltip key={group.name} title={group.name} placement="right" arrow>
              <Box
                onClick={(e) => (target ? go(target.path) : setFlyout({ el: e.currentTarget, group }))}
                sx={{
                  width: 48,
                  height: 48,
                  mx: 'auto',
                  mb: 0.75,
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: groupActive ? accent : 'text.secondary',
                  bgcolor: groupActive ? activeBg : 'transparent',
                  transition: 'all .2s',
                  '&:hover': { bgcolor: groupActive ? activeBg : hoverBg, transform: 'scale(1.06)' },
                }}
              >
                {SECTION_ICONS[group.name] || <DashboardOutlinedIcon />}
              </Box>
            </Tooltip>
          );
        }

        // ---- Expanded: single-item section is a plain link ----
        if (single) {
          return (
            <Box key={group.name} sx={{ mb: 0.5 }}>
              {renderItem(group.items[0])}
            </Box>
          );
        }

        // ---- Expanded: accordion section ----
        return (
          <Box key={group.name} sx={{ mb: 0.5 }}>
            <Box
              onClick={() => setOpenGroup(open ? null : group.name)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                height: 52,
                px: 1.75,
                borderRadius: '12px',
                cursor: 'pointer',
                userSelect: 'none',
                color: open || groupActive ? 'text.primary' : 'text.secondary',
                '&:hover': { bgcolor: hoverBg },
                transition: 'background-color .2s',
              }}
            >
              <Box sx={{ display: 'flex', color: groupActive ? accent : 'inherit', '& svg': { fontSize: 22 } }}>{SECTION_ICONS[group.name]}</Box>
              <Typography sx={{ flexGrow: 1, fontSize: NAV_FONT_SIZE, fontWeight: NAV_FONT_WEIGHT, color: 'inherit' }}>
                {group.name}
              </Typography>
              <ExpandMoreIcon sx={{ fontSize: 20, transition: 'transform .3s', transform: open ? 'rotate(180deg)' : 'none' }} />
            </Box>
            <Collapse in={open} timeout={280} unmountOnExit>
              <Box sx={{ pt: 0.5, pb: 1, pl: 1.25, ml: 2.75, borderLeft: `1px dashed ${theme.palette.divider}` }}>
                {group.items.map((item, i) => renderItem(item, i * 35))}
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </Box>
  );

  const content = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {brand}
      {nav}
      {expanded && (
        <Box sx={{ px: 1.75, pb: 2, pt: 1, flexShrink: 0, '@media (max-height: 820px)': { display: 'none' } }}>
          <Box sx={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 12px 24px -14px rgba(124,58,237,.7)' }}>
            <SidebarArt />
            <Box sx={{ position: 'absolute', left: 14, top: 12, color: '#fff', maxWidth: 120 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.2, color: '#fff' }}>Bleez.AI</Typography>
              <Typography sx={{ fontSize: '0.72rem', opacity: 0.85, lineHeight: 1.3, color: '#fff' }}>Travel intelligence, all in one place</Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer anchor="left" open={mobileSidebarOpen} onClose={() => dispatch(setMobileSidebarOpen(false))} PaperProps={{ sx: { width: SIDEBAR_WIDTH } }}>
        {content}
      </Drawer>
    );
  }

  return (
    <>
      {/* Wrapper is not clipped, so the toggle can sit on the sidebar's top-right edge in both states */}
      <Box
        component="aside"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: sidebarOpen ? SIDEBAR_WIDTH : COLLAPSED_WIDTH,
          zIndex: theme.zIndex.drawer,
          transition: theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: 300 }),
        }}
      >
        <Box
          sx={{
            height: '100%',
            overflow: 'hidden',
            borderRight: `1px solid ${theme.palette.divider}`,
            background: isDark
              ? 'linear-gradient(180deg, rgba(17,24,39,.96) 0%, rgba(11,15,25,.98) 100%)'
              : 'linear-gradient(180deg, #FFFFFF 0%, #FBFAFF 100%)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {content}
        </Box>

        <Tooltip title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'} placement="right">
          <IconButton
            onClick={() => dispatch(toggleSidebar())}
            size="small"
            aria-label="Toggle sidebar"
            sx={{
              position: 'absolute',
              top: 26,
              right: -14,
              width: 28,
              height: 28,
              bgcolor: 'background.default',
              color: accent,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: '0 4px 12px -2px rgba(124,58,237,.3)',
              transition: 'all .25s',
              '&:hover': { bgcolor: accent, color: '#fff', transform: 'scale(1.1)' },
            }}
          >
            {sidebarOpen ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Collapsed-state flyout listing a section's pages */}
      <Popover
        open={Boolean(flyout)}
        anchorEl={flyout?.el}
        onClose={() => setFlyout(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { ml: 1.5, p: 1, width: 230, borderRadius: '16px' } } }}
      >
        {flyout && (
          <>
            <Typography sx={{ px: 1.5, py: 0.75, fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'text.secondary' }}>
              {flyout.group.name}
            </Typography>
            {flyout.group.items.map((item, i) => renderItem(item, i * 30))}
          </>
        )}
      </Popover>
    </>
  );
};
