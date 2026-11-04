import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Bell, CheckCircle, AlertTriangle, Info, XCircle, 
  Plane, Calendar, Clock, MapPin, AlertCircle 
} from 'lucide-react';

const NotificationContext = createContext();

// Notification types with styling
const NOTIFICATION_TYPES = {
  success: { icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/10' },
  error: { icon: XCircle, color: 'text-red-400', bgColor: 'bg-red-500/10' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  info: { icon: Info, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  trip: { icon: Plane, color: 'text-primary', bgColor: 'bg-primary/10' },
  reminder: { icon: Calendar, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  urgent: { icon: AlertCircle, color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
  location: { icon: MapPin, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
  time: { icon: Clock, color: 'text-indigo-400', bgColor: 'bg-indigo-500/10' },
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications.slice(0, 50)));
  }, [notifications]);

  // Show a toast notification
  const notify = useCallback((message, type = 'info', options = {}) => {
    const { 
      duration = 4000, 
      action, 
      actionLabel = 'View',
      persistent = false,
      id = Date.now().toString(),
      title,
      description
    } = options;

    const typeConfig = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.info;
    const Icon = typeConfig.icon;

    // Add to notification list if persistent
    if (persistent) {
      const newNotification = {
        id,
        type,
        title: title || message,
        message: description || message,
        timestamp: new Date().toISOString(),
        read: false,
        action,
      };
      
      setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
      setUnreadCount(prev => prev + 1);
    }

    // Show toast
    toast.custom((t) => (
      <div 
        className={`flex items-start gap-3 p-4 rounded-xl border border-white/10 ${typeConfig.bgColor} backdrop-blur-xl max-w-md`}
        data-testid={`toast-${type}`}
      >
        <Icon className={`w-5 h-5 ${typeConfig.color} shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          {title && (
            <p className="font-medium text-sm text-foreground mb-0.5">{title}</p>
          )}
          <p className="text-sm text-foreground/90">{description || message}</p>
          {action && (
            <button
              onClick={() => {
                action();
                toast.dismiss(t);
              }}
              className={`mt-2 text-xs font-medium ${typeConfig.color} hover:underline`}
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    ), { duration, id });

    return id;
  }, []);

  // Shorthand methods
  const success = useCallback((message, options = {}) => 
    notify(message, 'success', options), [notify]);
  
  const error = useCallback((message, options = {}) => 
    notify(message, 'error', { duration: 6000, ...options }), [notify]);
  
  const warning = useCallback((message, options = {}) => 
    notify(message, 'warning', options), [notify]);
  
  const info = useCallback((message, options = {}) => 
    notify(message, 'info', options), [notify]);

  // Trip-specific notifications
  const tripNotification = useCallback((title, message, options = {}) => {
    return notify(message, 'trip', { 
      title, 
      description: message,
      persistent: true,
      duration: 5000,
      ...options 
    });
  }, [notify]);

  // Reminder notification
  const reminder = useCallback((title, message, options = {}) => {
    return notify(message, 'reminder', { 
      title,
      description: message,
      persistent: true,
      duration: 6000,
      ...options 
    });
  }, [notify]);

  // Urgent notification (for time-sensitive alerts)
  const urgent = useCallback((title, message, options = {}) => {
    return notify(message, 'urgent', { 
      title,
      description: message,
      persistent: true,
      duration: 8000,
      ...options 
    });
  }, [notify]);

  // Show modal notification
  const showModalNotification = useCallback((content) => {
    setModalContent(content);
    setShowModal(true);
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalContent(null);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Remove specific notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      notify,
      success,
      error,
      warning,
      info,
      tripNotification,
      reminder,
      urgent,
      showModalNotification,
      closeModal,
      showModal,
      modalContent,
      markAsRead,
      markAllAsRead,
      clearAll,
      removeNotification,
    }}>
      {children}
      
      {/* Modal Notification Overlay */}
      {showModal && modalContent && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
          data-testid="notification-modal-overlay"
        >
          <div 
            className="bg-card border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
            data-testid="notification-modal"
          >
            {typeof modalContent === 'string' ? (
              <p className="text-foreground">{modalContent}</p>
            ) : (
              modalContent
            )}
            <button
              onClick={closeModal}
              className="mt-4 w-full py-2 px-4 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
