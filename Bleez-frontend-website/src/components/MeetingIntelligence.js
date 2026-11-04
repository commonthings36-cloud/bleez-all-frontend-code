import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  MapPin, Clock, Car, PersonStanding, Train, Bike,
  AlertTriangle, Bell, Navigation, ExternalLink,
  MessageCircle, Phone, Mail, RefreshCw, Zap,
  CheckCircle, XCircle, ArrowRight, Timer
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const MeetingIntelligence = ({ 
  venue, 
  meetingTime, 
  meetingTitle = "Meeting",
  clientName = "",
  onClose 
}) => {
  const { token } = useAuth();
  const [userLocation, setUserLocation] = useState(null);
  const [travelInfo, setTravelInfo] = useState(null);
  const [selectedMode, setSelectedMode] = useState('driving');
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [delayMessage, setDelayMessage] = useState(null);

  // Get user's current location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationError(null);
      },
      (error) => {
        console.error("Location error:", error);
        setLocationError("Could not get your location. Please enable GPS.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Fetch travel info when location is available
  const fetchTravelInfo = useCallback(async () => {
    if (!userLocation || !venue || !token) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/meeting/travel-info`, {
        user_location: userLocation,
        venue: venue,
        meeting_time: meetingTime,
        mode: selectedMode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTravelInfo(response.data);
    } catch (error) {
      console.error("Failed to fetch travel info:", error);
      toast.error("Could not calculate travel time");
    } finally {
      setLoading(false);
    }
  }, [userLocation, venue, meetingTime, selectedMode, token]);

  // Initial location fetch
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // Fetch travel info when location or mode changes
  useEffect(() => {
    if (userLocation) {
      fetchTravelInfo();
    }
  }, [userLocation, selectedMode, fetchTravelInfo]);

  // Auto-refresh every 2 minutes for traffic updates
  useEffect(() => {
    if (!userLocation) return;
    
    const interval = setInterval(fetchTravelInfo, 120000);
    return () => clearInterval(interval);
  }, [userLocation, fetchTravelInfo]);

  // Generate delay notification
  const generateDelayNotification = async (delayMinutes) => {
    try {
      const response = await axios.post(`${API_URL}/api/meeting/notify-delay`, {
        delay_minutes: delayMinutes,
        client_name: clientName,
        meeting_purpose: meetingTitle,
        reason: travelInfo?.traffic_status === 'heavy' ? 'heavy traffic' : 'unexpected delay'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDelayMessage(response.data);
    } catch (error) {
      console.error("Failed to generate notification:", error);
    }
  };

  // Format time until leave
  const formatTimeUntilLeave = (seconds) => {
    if (seconds === null || seconds === undefined) return "Calculating...";
    if (seconds < 0) return "Leave now!";
    
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} mins`;
  };

  // Format leave time
  const formatLeaveTime = (isoString) => {
    if (!isoString) return "Calculating...";
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const modeIcons = {
    driving: <Car className="w-5 h-5" />,
    walking: <PersonStanding className="w-5 h-5" />,
    transit: <Train className="w-5 h-5" />,
    bicycling: <Bike className="w-5 h-5" />
  };

  const modeLabels = {
    driving: 'Car/Cab',
    walking: 'Walk',
    transit: 'Metro/Bus',
    bicycling: 'Bike'
  };

  const trafficColors = {
    light: 'text-green-500',
    normal: 'text-green-400',
    moderate: 'text-yellow-500',
    heavy: 'text-red-500',
    unknown: 'text-muted-foreground'
  };

  const trafficLabels = {
    light: 'Light Traffic',
    normal: 'Normal Traffic',
    moderate: 'Moderate Traffic',
    heavy: 'Heavy Traffic',
    unknown: 'Unknown'
  };

  return (
    <div className="rounded-2xl glass border border-white/10 overflow-hidden" data-testid="meeting-intelligence">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold">{meetingTitle}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {venue}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchTravelInfo}
            disabled={loading}
            className="h-8 w-8"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Location Error */}
      {locationError && (
        <div className="p-4 bg-red-500/10 border-b border-red-500/20">
          <p className="text-sm text-red-400 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            {locationError}
          </p>
          <Button size="sm" className="mt-2" onClick={getUserLocation}>
            Enable Location
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && !travelInfo && (
        <div className="p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground">Calculating route...</p>
        </div>
      )}

      {/* Travel Info */}
      {travelInfo && (
        <>
          {/* Main Stats */}
          <div className="grid grid-cols-3 border-b border-white/10">
            <div className="p-4 text-center border-r border-white/10">
              <p className="text-2xl font-bold text-primary">{travelInfo.distance}</p>
              <p className="text-xs text-muted-foreground">Distance</p>
            </div>
            <div className="p-4 text-center border-r border-white/10">
              <p className={cn("text-2xl font-bold", trafficColors[travelInfo.traffic_status])}>
                {travelInfo.travel_time}
              </p>
              <p className="text-xs text-muted-foreground">Travel Time</p>
            </div>
            <div className="p-4 text-center">
              <p className={cn(
                "text-2xl font-bold",
                travelInfo.time_until_leave_seconds < 0 ? "text-red-500" :
                travelInfo.time_until_leave_seconds < 600 ? "text-yellow-500" :
                "text-green-500"
              )}>
                {formatTimeUntilLeave(travelInfo.time_until_leave_seconds)}
              </p>
              <p className="text-xs text-muted-foreground">Until Departure</p>
            </div>
          </div>

          {/* Traffic Status */}
          <div className={cn(
            "px-4 py-3 border-b border-white/10 flex items-center justify-between",
            travelInfo.traffic_status === 'heavy' && "bg-red-500/10",
            travelInfo.traffic_status === 'moderate' && "bg-yellow-500/10"
          )}>
            <div className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full animate-pulse", 
                travelInfo.traffic_status === 'light' && "bg-green-500",
                travelInfo.traffic_status === 'normal' && "bg-green-400",
                travelInfo.traffic_status === 'moderate' && "bg-yellow-500",
                travelInfo.traffic_status === 'heavy' && "bg-red-500"
              )} />
              <span className={cn("text-sm font-medium", trafficColors[travelInfo.traffic_status])}>
                {trafficLabels[travelInfo.traffic_status]}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              Normal: {travelInfo.normal_travel_time}
            </span>
          </div>

          {/* Leave By Time */}
          <div className="p-4 bg-primary/5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Timer className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">You must leave by</p>
                  <p className="text-xl font-bold">{formatLeaveTime(travelInfo.must_leave_by)}</p>
                </div>
              </div>
              <a
                href={travelInfo.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Start Navigation
              </a>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="p-4 border-b border-white/10">
            <p className="text-xs text-muted-foreground mb-2">Travel Mode</p>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(modeLabels).map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={cn(
                    "p-3 rounded-xl text-center transition-all",
                    selectedMode === mode 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-white/5 hover:bg-white/10"
                  )}
                >
                  <div className="flex justify-center mb-1">{modeIcons[mode]}</div>
                  <p className="text-xs">{label}</p>
                  {travelInfo.travel_options[mode] && (
                    <p className="text-xs mt-1 opacity-70">
                      {travelInfo.travel_options[mode].duration}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Alerts */}
          {travelInfo.alerts?.length > 0 && (
            <div className="p-4 border-b border-white/10 space-y-2">
              {travelInfo.alerts.map((alert, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "p-3 rounded-xl flex items-start gap-3",
                    alert.type === 'critical' && "bg-red-500/20 border border-red-500/30",
                    alert.type === 'urgent' && "bg-orange-500/20 border border-orange-500/30",
                    alert.type === 'warning' && "bg-yellow-500/20 border border-yellow-500/30",
                    alert.type === 'info' && "bg-blue-500/20 border border-blue-500/30"
                  )}
                >
                  <AlertTriangle className={cn(
                    "w-5 h-5 shrink-0",
                    alert.type === 'critical' && "text-red-500",
                    alert.type === 'urgent' && "text-orange-500",
                    alert.type === 'warning' && "text-yellow-500",
                    alert.type === 'info' && "text-blue-500"
                  )} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    {alert.action === 'book_cab' && (
                      <div className="flex gap-2 mt-2">
                        <a 
                          href={travelInfo.cab_booking_links?.uber}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-black text-white text-xs rounded-lg"
                        >
                          Book Uber
                        </a>
                        <a 
                          href={travelInfo.cab_booking_links?.ola}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg"
                        >
                          Book Ola
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Faster Alternatives */}
          {travelInfo.faster_alternatives?.length > 0 && (
            <div className="p-4 bg-green-500/10 border-b border-white/10">
              <p className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Faster Alternatives Available
              </p>
              <div className="flex gap-2">
                {travelInfo.faster_alternatives.map((alt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedMode(alt.mode)}
                    className="px-3 py-2 bg-green-500/20 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                  >
                    {modeIcons[alt.mode]}
                    <span className="ml-2">{modeLabels[alt.mode]}</span>
                    <span className="ml-2 text-green-400">-{alt.saves}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Running Late Actions */}
          {travelInfo.time_until_leave_seconds < 0 && (
            <div className="p-4 bg-red-500/10">
              <p className="text-sm font-medium text-red-400 mb-3">Running Late? Notify your contact</p>
              
              {!delayMessage ? (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => generateDelayNotification(10)}
                    className="gap-1"
                  >
                    10 mins late
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => generateDelayNotification(15)}
                    className="gap-1"
                  >
                    15 mins late
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => generateDelayNotification(30)}
                    className="gap-1"
                  >
                    30 mins late
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm bg-white/5 p-3 rounded-lg">{delayMessage.message}</p>
                  <div className="flex gap-2">
                    <a
                      href={delayMessage.whatsapp_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Send via WhatsApp
                    </a>
                    <a
                      href={`sms:?body=${encodeURIComponent(delayMessage.message)}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <a
                      href={`mailto:?subject=${delayMessage.email_subject}&body=${encodeURIComponent(delayMessage.message)}`}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setDelayMessage(null)}
                  >
                    Change delay time
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MeetingIntelligence;
