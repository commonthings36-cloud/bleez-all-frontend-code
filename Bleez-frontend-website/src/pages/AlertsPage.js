import React, { useState, useEffect } from 'react';
import PageHero from '../components/PageHero';
import { IMG } from '../data/travelImages';
import { Navbar, Footer } from '../components/Layout';
import { useAlerts } from '../contexts/AlertsContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Bell, CloudRain, CloudLightning, Thermometer, Snowflake, 
  Wind, Sun, Car, MapPin, Calendar, Check, CheckCheck,
  AlertTriangle, Info, AlertCircle, RefreshCw, Filter,
  Clock, ChevronRight, Home, Plane
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { cn } from '../lib/utils';

const AlertsPage = () => {
  const { user } = useAuth();
  const { 
    alerts, 
    localAlerts,
    allAlerts,
    loading, 
    unreadCount, 
    lastFetched,
    userLocalLocation,
    fetchTripAlerts,
    fetchLocalAlerts, 
    markAsRead, 
    markAllAsRead,
    clearAlerts
  } = useAlerts();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('time'); // time, severity
  const [alertSource, setAlertSource] = useState('all'); // all, trips, local

  useEffect(() => {
    if (user) {
      fetchTripAlerts();
    }
    fetchLocalAlerts();
  }, [user, fetchTripAlerts, fetchLocalAlerts]);

  // Icon mapping
  const getIcon = (iconName, className = "w-5 h-5") => {
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

  // Get alerts based on source filter
  const getFilteredAlertsBySource = () => {
    switch (alertSource) {
      case 'trips':
        return alerts;
      case 'local':
        return localAlerts;
      default:
        return allAlerts;
    }
  };

  // Filter and sort alerts
  const processedAlerts = getFilteredAlertsBySource()
    .filter(alert => filter === 'all' || alert.type === filter)
    .sort((a, b) => {
      if (sortBy === 'severity') {
        const order = { critical: 0, warning: 1, info: 2 };
        return order[a.severity] - order[b.severity];
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Stats
  const stats = {
    total: allAlerts.length,
    unread: unreadCount,
    critical: allAlerts.filter(a => a.severity === 'critical').length,
    warning: allAlerts.filter(a => a.severity === 'warning').length,
    info: allAlerts.filter(a => a.severity === 'info').length,
    tripAlerts: alerts.length,
    localAlerts: localAlerts.length
  };

  return (
    <div className="min-h-screen flex flex-col" data-testid="alerts-page">
      <Navbar />
      <PageHero image={IMG.lagoon(1600)} eyebrow="Alerts" title="Stay in the loop" subtitle="Booking confirmations, reminders and travel updates." />
      
      <main className="flex-1 pt-10 pb-12">
        <div className="container-main max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center">
                  <Bell className="w-7 h-7 text-background" />
                </div>
                <div>
                  <h1 className="text-3xl font-serif mb-1">Alerts & Notifications</h1>
                  <p className="text-muted-foreground">
                    Stay informed about weather, traffic, and events for your trips
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="gap-2"
                onClick={fetchTripAlerts}
                disabled={loading}
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="p-4 rounded-xl glass border border-white/10">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Alerts</p>
            </div>
            <div className="p-4 rounded-xl glass border border-white/10">
              <p className="text-2xl font-bold text-primary">{stats.unread}</p>
              <p className="text-xs text-muted-foreground">Unread</p>
            </div>
            <div className="p-4 rounded-xl glass border border-red-500/20">
              <p className="text-2xl font-bold text-red-500">{stats.critical}</p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </div>
            <div className="p-4 rounded-xl glass border border-amber-500/20">
              <p className="text-2xl font-bold text-amber-500">{stats.warning}</p>
              <p className="text-xs text-muted-foreground">Warnings</p>
            </div>
            <div className="p-4 rounded-xl glass border border-blue-500/20">
              <p className="text-2xl font-bold text-blue-500">{stats.info}</p>
              <p className="text-xs text-muted-foreground">Info</p>
            </div>
          </div>

          {/* Source Tabs - All / Trip / Local */}
          <div className="mb-6">
            <Tabs value={alertSource} onValueChange={setAlertSource}>
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="all" className="gap-2">
                  <Bell className="w-4 h-4" />
                  All ({stats.total})
                </TabsTrigger>
                <TabsTrigger value="trips" className="gap-2">
                  <Plane className="w-4 h-4" />
                  Trip ({stats.tripAlerts})
                </TabsTrigger>
                <TabsTrigger value="local" className="gap-2">
                  <Home className="w-4 h-4" />
                  Local ({stats.localAlerts})
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {userLocalLocation && alertSource === 'local' && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Showing alerts for {userLocalLocation.city}, {userLocalLocation.country}
              </p>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'All', count: stats.total },
                { key: 'weather', label: 'Weather' },
                { key: 'traffic', label: 'Traffic' },
                { key: 'event', label: 'Events' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-full transition-colors",
                    filter === tab.key 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="flex-1" />
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="time">Most Recent</option>
                <option value="severity">By Severity</option>
              </select>
            </div>
            
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={markAllAsRead}
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </Button>
            )}
          </div>

          {/* Alerts List */}
          {loading && alerts.length === 0 ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-10 h-10 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading alerts...</p>
            </div>
          ) : processedAlerts.length === 0 ? (
            <div className="p-12 text-center glass rounded-2xl border border-white/10">
              <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No alerts</h3>
              <p className="text-muted-foreground text-sm">
                {filter === 'all' 
                  ? "Plan a trip to receive weather, traffic, and event alerts for your destinations."
                  : `No ${filter} alerts at the moment.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {processedAlerts.map((alert) => {
                const styles = getSeverityStyles(alert.severity);
                return (
                  <div
                    key={alert.id}
                    className={cn(
                      "p-5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01]",
                      styles.bg,
                      !alert.read && "ring-2 ring-primary/20"
                    )}
                    onClick={() => markAsRead(alert.id)}
                  >
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                        "bg-background/50"
                      )}>
                        <span className={styles.icon}>
                          {getIcon(alert.icon)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className={cn(
                              "font-semibold",
                              !alert.read && "text-foreground",
                              alert.read && "text-muted-foreground"
                            )}>
                              {alert.title}
                            </h3>
                            {/* Severity Badge */}
                            {alert.severity === 'critical' && (
                              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Critical
                              </span>
                            )}
                            {alert.severity === 'warning' && (
                              <span className="px-2 py-0.5 bg-amber-500 text-black text-xs rounded-full flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Warning
                              </span>
                            )}
                          </div>
                          {alert.read && (
                            <span className="flex items-center gap-1 text-xs text-green-500 shrink-0">
                              <Check className="w-3 h-3" />
                              Read
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {alert.message}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(alert.timestamp)}
                          </span>
                          {alert.trip_destination && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {alert.trip_destination}
                            </span>
                          )}
                          {alert.trip_dates && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {alert.trip_dates}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-white/10 rounded-full">
                            {alert.type}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Last Updated */}
          {lastFetched && (
            <p className="text-center text-xs text-muted-foreground mt-8">
              Last updated: {formatTime(lastFetched)}
            </p>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AlertsPage;
