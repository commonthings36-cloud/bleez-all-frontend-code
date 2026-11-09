import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { UsersPage } from '@/features/users/pages/UsersPage';
import { ApiMonitoringPage } from '@/features/api-monitoring/pages/ApiMonitoringPage';
import { AiManagementPage } from '@/features/ai-management/pages/AiManagementPage';
import { UserwiseAnalyticsPage } from '@/features/user-analytics/pages/UserwiseAnalyticsPage';
import { Error404Page } from '@/pages/Error404Page';
import { Error403Page } from '@/pages/Error403Page';
import { Box, CircularProgress } from '@mui/material';

// Lazy load secondary modules
const DestinationsPage = lazy(() => import('@/features/destinations/pages/DestinationsPage').then((m) => ({ default: m.DestinationsPage })));
const SafetyIntelligencePage = lazy(() => import('@/features/safety/pages/SafetyIntelligencePage').then((m) => ({ default: m.SafetyIntelligencePage })));
const EmergencySosPage = lazy(() => import('@/features/emergency/pages/EmergencySosPage').then((m) => ({ default: m.EmergencySosPage })));
const TravelBookingsPage = lazy(() => import('@/features/travel-bookings/pages/TravelBookingsPage').then((m) => ({ default: m.TravelBookingsPage })));
const BookingsPage = lazy(() => import('@/features/bookings/pages/BookingsPage').then((m) => ({ default: m.BookingsPage })));
const PaymentsPage = lazy(() => import('@/features/payments/pages/PaymentsPage').then((m) => ({ default: m.PaymentsPage })));
const ExpensesPage = lazy(() => import('@/features/expenses/pages/ExpensesPage').then((m) => ({ default: m.ExpensesPage })));
const CommunityPage = lazy(() => import('@/features/community/pages/CommunityPage').then((m) => ({ default: m.CommunityPage })));
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const ReportsPage = lazy(() => import('@/features/reports/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const SchedulerPage = lazy(() => import('@/features/scheduler/pages/SchedulerPage').then((m) => ({ default: m.SchedulerPage })));
const AuditLogsPage = lazy(() => import('@/features/audit-logs/pages/AuditLogsPage').then((m) => ({ default: m.AuditLogsPage })));
const CmsPage = lazy(() => import('@/features/cms/pages/CmsPage').then((m) => ({ default: m.CmsPage })));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const CampaignsPage = lazy(() => import('@/features/campaigns/pages/CampaignsPage').then((m) => ({ default: m.CampaignsPage })));
const SubscriptionManagementPage = lazy(() => import('@/features/subscriptions/pages/SubscriptionManagementPage').then((m) => ({ default: m.SubscriptionManagementPage })));
const WatermarkStudioPage = lazy(() => import('@/features/watermarks/pages/WatermarkStudioPage').then((m) => ({ default: m.WatermarkStudioPage })));
const B2bPortalPage = lazy(() => import('@/features/b2b/pages/B2bPortalPage').then((m) => ({ default: m.B2bPortalPage })));
const CustomerSubscriptionPage = lazy(() => import('@/features/subscriptions/pages/CustomerSubscriptionPage').then((m) => ({ default: m.CustomerSubscriptionPage })));

const LoadingFallback = (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <CircularProgress color="primary" />
  </Box>
);

export const router = createBrowserRouter([
  // Public Auth Routes
  {
    path: '/auth/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/register',
    element: <RegisterPage />,
  },
  {
    path: '/auth/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/auth/reset-password',
    element: <ResetPasswordPage />,
  },

  // Protected Admin Shell
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'users',
            element: <UsersPage />,
          },
          {
            path: 'user-analytics',
            element: <UserwiseAnalyticsPage />,
          },
          {
            path: 'campaigns',
            element: <Suspense fallback={LoadingFallback}><CampaignsPage /></Suspense>,
          },
          {
            path: 'subscriptions',
            element: <Suspense fallback={LoadingFallback}><SubscriptionManagementPage /></Suspense>,
          },
          {
            path: 'my-subscription',
            element: <Suspense fallback={LoadingFallback}><CustomerSubscriptionPage /></Suspense>,
          },
          {
            path: 'watermarks',
            element: <Suspense fallback={LoadingFallback}><WatermarkStudioPage /></Suspense>,
          },
          {
            path: 'b2b',
            element: <Suspense fallback={LoadingFallback}><B2bPortalPage /></Suspense>,
          },
          {
            path: 'ai-management',
            element: <Suspense fallback={LoadingFallback}><AiManagementPage /></Suspense>,
          },
          {
            path: 'destinations',
            element: <Suspense fallback={LoadingFallback}><DestinationsPage /></Suspense>,
          },
          {
            path: 'safety',
            element: <Suspense fallback={LoadingFallback}><SafetyIntelligencePage /></Suspense>,
          },
          {
            path: 'emergency',
            element: <Suspense fallback={LoadingFallback}><EmergencySosPage /></Suspense>,
          },
          {
            path: 'travel-bookings',
            element: <Suspense fallback={LoadingFallback}><TravelBookingsPage /></Suspense>,
          },
          {
            path: 'bookings',
            element: <Suspense fallback={LoadingFallback}><BookingsPage /></Suspense>,
          },
          {
            path: 'payments',
            element: <Suspense fallback={LoadingFallback}><PaymentsPage /></Suspense>,
          },
          {
            path: 'expenses',
            element: <Suspense fallback={LoadingFallback}><ExpensesPage /></Suspense>,
          },
          {
            path: 'community',
            element: <Suspense fallback={LoadingFallback}><CommunityPage /></Suspense>,
          },
          {
            path: 'notifications',
            element: <Suspense fallback={LoadingFallback}><NotificationsPage /></Suspense>,
          },
          {
            path: 'reports',
            element: <Suspense fallback={LoadingFallback}><ReportsPage /></Suspense>,
          },
          {
            path: 'scheduler',
            element: <Suspense fallback={LoadingFallback}><SchedulerPage /></Suspense>,
          },
          {
            path: 'audit-logs',
            element: <Suspense fallback={LoadingFallback}><AuditLogsPage /></Suspense>,
          },
          {
            path: 'cms',
            element: <Suspense fallback={LoadingFallback}><CmsPage /></Suspense>,
          },
          {
            path: 'settings',
            element: <Suspense fallback={LoadingFallback}><SettingsPage /></Suspense>,
          },
          {
            path: 'api-monitoring',
            element: <ApiMonitoringPage />,
          },
        ],
      },
    ],
  },

  // Error Pages
  {
    path: '/403',
    element: <Error403Page />,
  },
  {
    path: '*',
    element: <Error404Page />,
  },
]);
