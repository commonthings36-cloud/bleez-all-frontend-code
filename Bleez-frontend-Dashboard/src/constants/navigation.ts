import { NavItem } from '@/types';

// Ordered by admin workflow: check health -> serve customers -> manage revenue -> moderate community -> watch the platform.
export const NAVIGATION_CONFIG: NavItem[] = [
  { id: 'dashboard', title: 'Overview', path: '/dashboard', icon: 'DashboardOutlined', section: 'Overview' },

  { id: 'users', title: 'Users', path: '/users', icon: 'PeopleOutlined', section: 'Customers' },
  { id: 'user-analytics', title: 'User Analytics', path: '/user-analytics', icon: 'AnalyticsOutlined', section: 'Customers' },
  { id: 'bookings', title: 'Bookings', path: '/bookings', icon: 'FlightTakeoffOutlined', section: 'Customers' },
  { id: 'travel-bookings', title: 'Hotels, Flights & Dining', path: '/travel-bookings', icon: 'TravelExploreOutlined', section: 'Customers' },

  { id: 'subscriptions', title: 'Subscription Studio', path: '/subscriptions', icon: 'WorkspacePremiumOutlined', section: 'Revenue' },
  { id: 'payments', title: 'Payments', path: '/payments', icon: 'CreditCardOutlined', section: 'Revenue' },
  { id: 'campaigns', title: 'Campaigns', path: '/campaigns', icon: 'CampaignOutlined', section: 'Revenue' },
  { id: 'b2b', title: 'B2B Organization', path: '/b2b', icon: 'BusinessOutlined', section: 'Revenue' },
  { id: 'watermarks', title: 'Watermarks', path: '/watermarks', icon: 'BrandingWatermarkOutlined', section: 'Revenue' },

  { id: 'destinations', title: 'Destinations', path: '/destinations', icon: 'PublicOutlined', section: 'Content' },
  // Safety Intelligence is hidden from the menu for now (route /safety still exists).
  { id: 'emergency', title: 'Emergency SOS', path: '/emergency', icon: 'WarningAmberOutlined', section: 'Content' },
  { id: 'community', title: 'Community', path: '/community', icon: 'ForumOutlined', section: 'Content' },
  { id: 'notifications', title: 'Notifications', path: '/notifications', icon: 'NotificationsNoneOutlined', section: 'Content' },
  { id: 'expenses', title: 'Trip Expenses', path: '/expenses', icon: 'AccountBalanceWalletOutlined', section: 'Content' },
  { id: 'cms', title: 'CMS & Content', path: '/cms', icon: 'ArticleOutlined', section: 'Content' },

  { id: 'ai-management', title: 'AI Usage', path: '/ai-management', icon: 'AutoAwesomeOutlined', section: 'Platform' },
  { id: 'api-monitoring', title: 'API Monitoring', path: '/api-monitoring', icon: 'MonitorHeartOutlined', section: 'Platform' },
  { id: 'reports', title: 'Reports & Analytics', path: '/reports', icon: 'AssessmentOutlined', section: 'Platform' },
  { id: 'scheduler', title: 'Task Scheduler', path: '/scheduler', icon: 'ScheduleOutlined', section: 'Platform' },
  { id: 'audit-logs', title: 'Audit Logs', path: '/audit-logs', icon: 'ReceiptLongOutlined', section: 'Platform' },
  { id: 'settings', title: 'Settings', path: '/settings', icon: 'SettingsOutlined', section: 'Platform' },
];
