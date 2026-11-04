import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DynamicBackgroundContext = createContext(null);

export const useDynamicBackground = () => {
  const context = useContext(DynamicBackgroundContext);
  if (!context) {
    throw new Error('useDynamicBackground must be used within DynamicBackgroundProvider');
  }
  return context;
};

// Visual asset mappings for different themes
const THEME_VISUALS = {
  travel: {
    particles: ['✈️', '🌍', '🗺️', '🧳'],
    colors: ['#7C3AED', '#F59E0B', '#EAB308'],
    pattern: 'globe'
  },
  culinary: {
    particles: ['🍜', '🍣', '🥘', '🍷'],
    colors: ['#F59E0B', '#EA580C', '#DC2626'],
    pattern: 'culinary'
  },
  forest: {
    particles: ['🌲', '🌿', '🍃', '🦋'],
    colors: ['#10B981', '#059669', '#047857'],
    pattern: 'nature'
  },
  mountain: {
    particles: ['⛰️', '🏔️', '🧗', '🎿'],
    colors: ['#0EA5E9', '#0284C7', '#0369A1'],
    pattern: 'adventure'
  },
  architecture: {
    particles: ['🏛️', '🎭', '🖼️', '📜'],
    colors: ['#8B5CF6', '#7C3AED', '#6D28D9'],
    pattern: 'culture'
  },
  city: {
    particles: ['🏙️', '💼', '📊', '🤝'],
    colors: ['#64748B', '#475569', '#334155'],
    pattern: 'business'
  },
  temple: {
    particles: ['🕉️', '☯️', '🙏', '🪷'],
    colors: ['#EC4899', '#DB2777', '#BE185D'],
    pattern: 'spiritual'
  },
  night_city: {
    particles: ['🌃', '🎉', '🍸', '🎵'],
    colors: ['#A855F7', '#9333EA', '#7E22CE'],
    pattern: 'nightlife'
  },
  sunset: {
    particles: ['🌅', '💕', '🌹', '🥂'],
    colors: ['#F43F5E', '#E11D48', '#BE123C'],
    pattern: 'romantic'
  },
  family_fun: {
    particles: ['👨‍👩‍👧‍👦', '🎢', '🎠', '🎪'],
    colors: ['#3B82F6', '#2563EB', '#1D4ED8'],
    pattern: 'family'
  },
  ambient: {
    particles: ['✨', '💫', '⭐', '🌟'],
    colors: ['#94A3B8', '#64748B', '#475569'],
    pattern: 'default'
  },
  maps: {
    particles: ['📍', '🗺️', '🧭', '📌'],
    colors: ['#7C3AED', '#F59E0B', '#EAB308'],
    pattern: 'planning'
  },
  confirmation: {
    particles: ['✅', '🎉', '✨', '🎊'],
    colors: ['#10B981', '#059669', '#047857'],
    pattern: 'success'
  },
  location: {
    particles: ['📍', '🚗', '✈️', '🗺️'],
    colors: ['#0EA5E9', '#0284C7', '#0369A1'],
    pattern: 'journey'
  }
};

// Time-based ambient adjustments
const TIME_ADJUSTMENTS = {
  morning: {
    brightness: 1.1,
    warmth: 0.1,
    ambientColor: 'rgba(255, 200, 150, 0.05)'
  },
  afternoon: {
    brightness: 1.0,
    warmth: 0,
    ambientColor: 'rgba(255, 255, 255, 0.02)'
  },
  evening: {
    brightness: 0.9,
    warmth: 0.15,
    ambientColor: 'rgba(255, 150, 100, 0.08)'
  },
  night: {
    brightness: 0.7,
    warmth: -0.1,
    ambientColor: 'rgba(100, 100, 200, 0.1)'
  }
};

// Route to activity mapping
const ROUTE_ACTIVITY_MAP = {
  '/': 'browsing',
  '/plan': 'planning',
  '/booking-compare': 'booking',
  '/itinerary': 'traveling',
  '/my-trips': 'traveling',
  '/albums': 'browsing',
  '/community': 'browsing',
  '/profile': 'browsing',
  '/login': 'browsing',
  '/register': 'browsing'
};

// Helper to get activity from path
const getActivityFromPath = (pathname) => {
  if (ROUTE_ACTIVITY_MAP[pathname]) {
    return ROUTE_ACTIVITY_MAP[pathname];
  }
  if (pathname.startsWith('/itinerary')) return 'traveling';
  if (pathname.startsWith('/booking')) return 'booking';
  return 'browsing';
};

export const DynamicBackgroundProvider = ({ children }) => {
  const { user, token } = useAuth();
  const location = useLocation();
  
  const [theme, setTheme] = useState({
    gradient: 'from-primary/10 via-background to-background',
    accent: '#7C3AED',
    animation: 'subtle-float',
    visual_type: 'travel',
    time_variant: 'afternoon',
    local_experience: 'nearby_attractions'
  });
  
  const [visuals, setVisuals] = useState(THEME_VISUALS.travel);
  const [timeAdjustment, setTimeAdjustment] = useState(TIME_ADJUSTMENTS.afternoon);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const customContextRef = useRef(null);

  // Derive current activity from path (no setState needed)
  const currentActivity = useMemo(() => {
    return getActivityFromPath(location.pathname);
  }, [location.pathname]);

  // Fetch theme from API
  const fetchTheme = useCallback(async () => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const params = new URLSearchParams();
      
      if (currentActivity) params.append('activity', currentActivity);
      if (customContextRef.current?.tripType) params.append('trip_type', customContextRef.current.tripType);
      if (customContextRef.current?.destination) params.append('destination', customContextRef.current.destination);
      
      const response = await axios.get(
        `${API}/dashboard/theme?${params.toString()}`,
        { 
          withCredentials: true,
          headers 
        }
      );
      
      // Smooth transition
      setIsTransitioning(true);
      setTimeout(() => {
        setTheme(response.data);
        setVisuals(THEME_VISUALS[response.data.visual_type] || THEME_VISUALS.travel);
        setTimeAdjustment(TIME_ADJUSTMENTS[response.data.time_variant] || TIME_ADJUSTMENTS.afternoon);
        setIsTransitioning(false);
      }, 300);
      
    } catch (error) {
      console.error('Failed to fetch theme:', error);
    }
  }, [token, currentActivity]);

  // Fetch theme on activity change - this is intentional as we need to fetch from API
  // when activity changes (route navigation, context updates)
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const params = new URLSearchParams();
        
        if (currentActivity) params.append('activity', currentActivity);
        if (customContextRef.current?.tripType) params.append('trip_type', customContextRef.current.tripType);
        if (customContextRef.current?.destination) params.append('destination', customContextRef.current.destination);
        
        const response = await axios.get(
          `${API}/dashboard/theme?${params.toString()}`,
          { 
            withCredentials: true,
            headers 
          }
        );
        
        if (isMounted) {
          setIsTransitioning(true);
          setTimeout(() => {
            if (isMounted) {
              setTheme(response.data);
              setVisuals(THEME_VISUALS[response.data.visual_type] || THEME_VISUALS.travel);
              setTimeAdjustment(TIME_ADJUSTMENTS[response.data.time_variant] || TIME_ADJUSTMENTS.afternoon);
              setIsTransitioning(false);
            }
          }, 300);
        }
      } catch (error) {
        console.error('Failed to fetch theme:', error);
      }
    };
    
    fetchData();
    return () => { isMounted = false; };
  }, [token, currentActivity]);

  // Update custom context (for trip planning, etc.)
  const updateContext = useCallback((context) => {
    customContextRef.current = { ...customContextRef.current, ...context };
    // Trigger a re-fetch by updating a dependency - use activity as trigger
  }, []);

  // Force a specific visual type temporarily
  const setTemporaryVisual = useCallback((visualType, duration = 3000) => {
    const newVisuals = THEME_VISUALS[visualType] || THEME_VISUALS.travel;
    setVisuals(newVisuals);
    
    if (duration > 0) {
      const currentVisuals = visuals;
      setTimeout(() => {
        setVisuals(currentVisuals);
      }, duration);
    }
  }, [visuals]);

  // Get CSS variables for current theme
  const getCSSVariables = useCallback(() => {
    return {
      '--dynamic-accent': theme.accent,
      '--dynamic-gradient': theme.gradient,
      '--dynamic-brightness': timeAdjustment.brightness,
      '--dynamic-ambient': timeAdjustment.ambientColor,
    };
  }, [theme, timeAdjustment]);

  const value = useMemo(() => ({
    theme,
    visuals,
    timeAdjustment,
    currentActivity,
    isTransitioning,
    updateContext,
    setTemporaryVisual,
    getCSSVariables,
    refreshTheme: fetchTheme
  }), [theme, visuals, timeAdjustment, currentActivity, isTransitioning, updateContext, setTemporaryVisual, getCSSVariables, fetchTheme]);

  return (
    <DynamicBackgroundContext.Provider value={value}>
      {children}
    </DynamicBackgroundContext.Provider>
  );
};
