export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'SAFETY_OFFICER' | 'SUPPORT' | 'USER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: Role;
  permissions: string[];
  status: 'ACTIVE' | 'BLOCKED' | 'PENDING';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;
}

export interface ThemeState {
  mode: 'light' | 'dark';
}

export interface UIState {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  activeNotificationsCount: number;
}

export interface NavItem {
  id: string;
  title: string;
  path: string;
  icon: string;
  badge?: string | number;
  section?: string;
  roles?: Role[];
  children?: NavItem[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
