import { NavItem } from '@/types';

// Ordered by admin workflow: check health -> serve customers -> manage revenue -> moderate community -> watch the platform.
// Only modules backed by a real API are listed (see FRONTEND_AUDIT.md for modules the backend does not support).
export const NAVIGATION_CONFIG: NavItem[] = [
  { id: 'dashboard', title: 'Overview', path: '/dashboard', icon: 'DashboardOutlined', section: 'Overview' },

  { id: 'users', title: 'Users', path: '/users', icon: 'PeopleOutlined', section: 'Customers' },
  { id: 'user-analytics', title: 'User Analytics', path: '/user-analytics', icon: 'AnalyticsOutlined', section: 'Customers' },
  { id: 'bookings', title: 'Bookings', path: '/bookings', icon: 'FlightTakeoffOutlined', section: 'Customers' },

  { id: 'subscriptions', title: 'Subscription Studio', path: '/subscriptions', icon: 'WorkspacePremiumOutlined', section: 'Revenue' },
  { id: 'payments', title: 'Payments', path: '/payments', icon: 'CreditCardOutlined', section: 'Revenue' },
  { id: 'campaigns', title: 'Campaigns', path: '/campaigns', icon: 'CampaignOutlined', section: 'Revenue' },
  { id: 'b2b', title: 'B2B Organization', path: '/b2b', icon: 'BusinessOutlined', section: 'Revenue' },
  { id: 'watermarks', title: 'Watermarks', path: '/watermarks', icon: 'BrandingWatermarkOutlined', section: 'Revenue' },

  { id: 'community', title: 'Community', path: '/community', icon: 'ForumOutlined', section: 'Content' },
  { id: 'notifications', title: 'Notifications', path: '/notifications', icon: 'NotificationsNoneOutlined', section: 'Content' },
  { id: 'destinations', title: 'Destinations', path: '/destinations', icon: 'PublicOutlined', section: 'Content' },
  { id: 'expenses', title: 'Trip Expenses', path: '/expenses', icon: 'AccountBalanceWalletOutlined', section: 'Content' },

  { id: 'ai-management', title: 'AI Usage', path: '/ai-management', icon: 'AutoAwesomeOutlined', section: 'Platform' },
  { id: 'api-monitoring', title: 'API Monitoring', path: '/api-monitoring', icon: 'MonitorHeartOutlined', section: 'Platform' },
];
