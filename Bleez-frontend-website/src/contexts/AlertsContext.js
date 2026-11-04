import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const AlertsContext = createContext();

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const AlertsProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [localAlerts, setLocalAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastFetched, setLastFetched] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [userLocalLocation, setUserLocalLocation] = useState(null);

  // Get token from localStorage as fallback
  const getAuthToken = useCallback(() => {
    return token || localStorage.getItem('token');
  }, [token]);

  // Detect user's current location
  const detectUserLocation = useCallback(async () => {
    try {
      // Try geolocation services
      let locationData = null;
      
      try {
        const response = await axios.get('https://ipapi.co/json/', { timeout: 5000 });
        if (response.data) {
          locationData = {
            city: response.data.city,
            country: response.data.country_name,
            countryCode: response.data.country_code,
            region: response.data.region
          };
        }
      } catch (e) {
        console.log('Primary location detection failed');
      }
      
      if (!locationData) {
        try {
          const response = await axios.get('http://ip-api.com/json/', { timeout: 5000 });
          if (response.data) {
            locationData = {
              city: response.data.city,
              country: response.data.country,
              countryCode: response.data.countryCode,
              region: response.data.regionName
            };
          }
        } catch (e) {
          console.log('Backup location detection failed');
        }
      }
      
      if (locationData) {
        setUserLocalLocation(locationData);
        return locationData;
      }
    } catch (error) {
      console.log('Location detection error:', error);
    }
    return null;
  }, []);

  // Fetch alerts for a specific location (no auth required)
  const fetchLocationAlerts = useCallback(async (location) => {
    if (!location) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/alerts/${encodeURIComponent(location)}`);
      const data = response.data;
      setAlerts(data.alerts || []);
      setUnreadCount(data.unread_count || 0);
      setLastFetched(new Date().toISOString());
      setCurrentLocation(location);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch local alerts for user's current location
  const fetchLocalAlerts = useCallback(async () => {
    let location = userLocalLocation;
    
    if (!location) {
      location = await detectUserLocation();
    }
    
    if (!location?.city) return;
    
    try {
      const locationStr = `${location.city}, ${location.country}`;
      const response = await axios.get(`${API_URL}/api/alerts/${encodeURIComponent(locationStr)}`);
      const data = response.data;
      
      // Mark these as local alerts
      const localAlertsData = (data.alerts || []).map(alert => ({
        ...alert,
        isLocal: true,
        localCity: location.city
      }));
      
      setLocalAlerts(localAlertsData);
    } catch (error) {
      console.error('Failed to fetch local alerts:', error);
    }
  }, [userLocalLocation, detectUserLocation]);

  // Fetch alerts for user's upcoming trips
  const fetchTripAlerts = useCallback(async () => {
    const authToken = getAuthToken();
    if (!user || !authToken) {
      console.log('No user or token for trip alerts');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/alerts/user/trips`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = response.data;
      setAlerts(data.alerts || []);
      setUnreadCount(data.alerts?.filter(a => !a.read).length || 0);
      setLastFetched(new Date().toISOString());
    } catch (error) {
      console.error('Failed to fetch trip alerts:', error);
      // Fallback to location-based alerts if user has a detected country
      if (user?.detected_country) {
        await fetchLocationAlerts(user.detected_country);
      }
    } finally {
      setLoading(false);
    }
  }, [user, getAuthToken, fetchLocationAlerts]);

  // Get all alerts (trip + local)
  const getAllAlerts = useCallback(() => {
    // Combine trip alerts and local alerts, avoiding duplicates
    const tripAlertIds = new Set(alerts.map(a => a.id));
    const uniqueLocalAlerts = localAlerts.filter(a => !tripAlertIds.has(a.id));
    return [...alerts, ...uniqueLocalAlerts];
  }, [alerts, localAlerts]);

  // Mark alert as read
  const markAsRead = useCallback((alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
    setLocalAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all alerts as read
  const markAllAsRead = useCallback(() => {
    setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
    setLocalAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
    setUnreadCount(0);
  }, []);

  // Clear all alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
    setLocalAlerts([]);
    setUnreadCount(0);
  }, []);

  // Detect location on mount
  useEffect(() => {
    detectUserLocation();
  }, [detectUserLocation]);

  // Auto-fetch local alerts when location is detected
  useEffect(() => {
    if (userLocalLocation?.city) {
      fetchLocalAlerts();
    }
  }, [userLocalLocation, fetchLocalAlerts]);

  // Auto-fetch alerts when user logs in
  useEffect(() => {
    const authToken = getAuthToken();
    if (user && authToken) {
      fetchTripAlerts();
    }
  }, [user, getAuthToken, fetchTripAlerts]);

  // Auto-refresh alerts every 5 minutes
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      if (currentLocation) {
        fetchLocationAlerts(currentLocation);
      } else {
        fetchTripAlerts();
      }
      // Also refresh local alerts
      fetchLocalAlerts();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user, currentLocation, fetchLocationAlerts, fetchTripAlerts, fetchLocalAlerts]);

  const value = {
    alerts,
    localAlerts,
    allAlerts: getAllAlerts(),
    loading,
    unreadCount,
    lastFetched,
    currentLocation,
    userLocalLocation,
    fetchLocationAlerts,
    fetchTripAlerts,
    fetchLocalAlerts,
    markAsRead,
    markAllAsRead,
    clearAlerts
  };

  return (
    <AlertsContext.Provider value={value}>
      {children}
    </AlertsContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
};

export default AlertsContext;
