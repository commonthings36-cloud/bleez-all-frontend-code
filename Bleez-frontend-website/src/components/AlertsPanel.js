import React, { useState, useEffect } from 'react';
import { useAlerts } from '../contexts/AlertsContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Bell, X, CloudRain, CloudLightning, Thermometer, Snowflake, 
  Wind, Sun, Car, MapPin, Calendar, Check, CheckCheck,
  AlertTriangle, Info, AlertCircle, RefreshCw
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

const AlertsPanel = () => {
  const { user } = useAuth();
  const { isLight } = useTheme();
  const { 
    alerts, 
    loading, 
    unreadCount, 
    lastFetched,
    fetchTripAlerts, 
    markAsRead, 
    markAllAsRead 
  } = useAlerts();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, weather, traffic, event

  // Icon mapping
  const getIcon = (iconName, className = "w-4 h-4") => {
    const icons = {
      'cloud-rain': <CloudRain className={className} />,
      'cloud-lightning': <CloudLightning className={className} />,
      'thermometer': <Thermometer className={className} />,
      'snowflake': <Snowflake className={className} />,
      'wind': <Wind className={className} />,
      'sun': <Sun className={className} />,
      'car': <Car className={className} />,
      'map-pin': <MapPin className={className} />,
    };
    return icons[iconName] || <Info className={className} />;
  };

  // Severity styling
  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-500/20 border-red-500/50',
          icon: 'text-red-500',
          badge: 'bg-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/20 border-amber-500/50',
          icon: 'text-amber-500',
          badge: 'bg-amber-500'
        };
      default:
        return {
          bg: 'bg-blue-500/20 border-blue-500/50',
          icon: 'text-blue-500',
          badge: 'bg-blue-500'
        };
    }
  };

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.type === filter;
  });

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('.alerts-panel-container')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!user) return null;

  return (
    <div className="relative alerts-panel-container">
      {/* Bell Icon Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="alerts-bell"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Alerts Panel Dropdown */}
      {isOpen && (
        <div className={cn(
          "absolute right-0 top-full mt-2 w-96 max-h-[70vh] rounded-2xl shadow-2xl overflow-hidden z-50",
          isLight 
            ? "bg-white border border-gray-200" 
            : "glass border border-white/10"
        )}>
          {/* Header */}
          <div className={cn(
            "p-4 border-b",
            isLight ? "border-gray-200 bg-gray-50" : "border-white/10"
          )}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={cn(
                "font-semibold text-lg flex items-center gap-2",
                isLight ? "text-gray-900" : "text-foreground"
              )}>
                <Bell className="w-5 h-5 text-primary" />
                Alerts & Notifications
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8", isLight && "hover:bg-gray-100")}
                  onClick={fetchTripAlerts}
                  disabled={loading}
                  title="Refresh alerts"
                >
                  <RefreshCw className={cn("w-4 h-4", loading && "animate-spin", isLight && "text-gray-600")} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8", isLight && "hover:bg-gray-100")}
                  onClick={() => setIsOpen(false)}
                >
                  <X className={cn("w-4 h-4", isLight && "text-gray-600")} />
                </Button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className={cn(
              "flex gap-1 rounded-lg p-1",
              isLight ? "bg-gray-100" : "bg-white/5"
            )}>
              {[
                { key: 'all', label: 'All' },
                { key: 'weather', label: 'Weather' },
                { key: 'traffic', label: 'Traffic' },
                { key: 'event', label: 'Events' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={cn(
                    "flex-1 py-1.5 px-2 text-xs rounded-md transition-colors",
                    filter === tab.key 
                      ? "bg-primary text-primary-foreground" 
                      : isLight 
                        ? "text-gray-500 hover:text-gray-900"
                        : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Alerts List */}
          <div className="overflow-y-auto max-h-[50vh]">
            {loading && alerts.length === 0 ? (
              <div className={cn(
                "p-8 text-center",
                isLight ? "text-gray-500" : "text-muted-foreground"
              )}>
                <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p>Loading alerts...</p>
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className={cn(
                "p-8 text-center",
                isLight ? "text-gray-500" : "text-muted-foreground"
              )}>
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No alerts at the moment</p>
                <p className="text-xs mt-1">Plan a trip to receive location alerts</p>
              </div>
            ) : (
              <div className={cn(
                "divide-y",
                isLight ? "divide-gray-100" : "divide-white/5"
              )}>
                {filteredAlerts.map((alert) => {
                  const styles = getSeverityStyles(alert.severity);
                  return (
                    <div
                      key={alert.id}
                      className={cn(
                        "p-4 transition-colors cursor-pointer",
                        isLight 
                          ? "hover:bg-gray-50" 
                          : "hover:bg-white/5",
                        !alert.read && (isLight ? "bg-blue-50/50" : "bg-white/3")
                      )}
                      onClick={() => markAsRead(alert.id)}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          styles.bg
                        )}>
                          <span className={styles.icon}>
                            {getIcon(alert.icon)}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={cn(
                              "font-medium text-sm",
                              !alert.read && (isLight ? "text-gray-900" : "text-foreground"),
                              alert.read && (isLight ? "text-gray-500" : "text-muted-foreground")
                            )}>
                              {alert.title}
                            </h4>
                            {/* Severity Badge */}
                            {alert.severity === 'critical' && (
                              <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-xs rounded-full flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Critical
                              </span>
                            )}
                            {alert.severity === 'warning' && (
                              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-500 text-xs rounded-full flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Warning
                              </span>
                            )}
                          </div>
                          <p className={cn(
                            "text-xs mt-1 line-clamp-2",
                            isLight ? "text-gray-600" : "text-muted-foreground"
                          )}>
                            {alert.message}
                          </p>
                          <div className={cn(
                            "flex items-center gap-3 mt-2 text-xs",
                            isLight ? "text-gray-500" : "text-muted-foreground"
                          )}>
                            <span>{formatTime(alert.timestamp)}</span>
                            {alert.trip_destination && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {alert.trip_destination}
                              </span>
                            )}
                            {alert.read && (
                              <span className="flex items-center gap-1 text-green-500">
                                <Check className="w-3 h-3" />
                                Read
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredAlerts.length > 0 && (
            <div className={cn(
              "p-3 border-t flex items-center justify-between",
              isLight ? "border-gray-200 bg-gray-50" : "border-white/10"
            )}>
              <span className={cn(
                "text-xs",
                isLight ? "text-gray-500" : "text-muted-foreground"
              )}>
                {lastFetched && `Updated ${formatTime(lastFetched)}`}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className={cn("text-xs gap-1", isLight && "text-gray-600 hover:text-gray-900")}
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;
