import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Phone, AlertTriangle, X, Shield, Ambulance, Flame, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const EmergencyIcon = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [emergencyData, setEmergencyData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hide on itinerary pages - emergency info accessible via Settings/Help instead
  const hiddenPaths = ['/itinerary'];
  const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));

  useEffect(() => {
    if (!shouldHide) {
      detectLocation();
    }
  }, [shouldHide]);

  const detectLocation = async () => {
    try {
      const response = await axios.get(`${API}/emergency/detect-location`);
      setEmergencyData(response.data);
    } catch (error) {
      // Fallback to default
      setEmergencyData({
        detected: false,
        country_code: 'DEFAULT',
        country: 'Unknown',
        emergency_numbers: {
          police: '112',
          ambulance: '112',
          fire: '112',
          tourist_helpline: 'N/A'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const emergencyServices = [
    {
      name: 'Police',
      icon: Shield,
      number: emergencyData?.emergency_numbers?.police || '112',
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Law enforcement'
    },
    {
      name: 'Ambulance',
      icon: Ambulance,
      number: emergencyData?.emergency_numbers?.ambulance || '112',
      color: 'bg-red-600 hover:bg-red-700',
      description: 'Medical emergency'
    },
    {
      name: 'Fire',
      icon: Flame,
      number: emergencyData?.emergency_numbers?.fire || '112',
      color: 'bg-orange-600 hover:bg-orange-700',
      description: 'Fire department'
    },
    {
      name: 'Tourist Helpline',
      icon: HelpCircle,
      number: emergencyData?.emergency_numbers?.tourist_helpline || 'N/A',
      color: 'bg-green-600 hover:bg-green-700',
      description: 'Travel assistance'
    }
  ];

  const handleCall = (number) => {
    if (number && number !== 'N/A') {
      window.location.href = `tel:${number}`;
    }
  };

  // Don't render on itinerary pages - emergency info accessible via Settings/Help
  if (shouldHide) {
    return null;
  }

  return (
    <>
      {/* Fixed Emergency Button - Left side to avoid overlap with AI Chat */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-600 hover:bg-red-700 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 animate-pulse-slow"
        title="Emergency Numbers"
        data-testid="emergency-btn"
      >
        <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </button>

      {/* Emergency Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-card border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
            {/* Header */}
            <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-white" />
                <div>
                  <h2 className="text-lg font-bold text-white">Emergency Services</h2>
                  <p className="text-red-100 text-sm">
                    {loading ? 'Detecting location...' : (emergencyData?.country || 'Your location')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Emergency Numbers */}
            <div className="p-4 space-y-3">
              {emergencyServices.map((service) => (
                <button
                  key={service.name}
                  onClick={() => handleCall(service.number)}
                  disabled={service.number === 'N/A'}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl ${service.color} text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <service.icon className="w-8 h-8" />
                  <div className="flex-1 text-left">
                    <p className="font-bold text-lg">{service.name}</p>
                    <p className="text-white/80 text-sm">{service.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-2xl font-bold">{service.number}</p>
                    {service.number !== 'N/A' && (
                      <p className="text-xs text-white/70">Tap to call</p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white/5 border-t border-white/10">
              <p className="text-xs text-muted-foreground text-center">
                Emergency numbers are based on your detected location: <strong>{emergencyData?.country || 'Unknown'}</strong>
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="w-full mt-3"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        @keyframes pulse-slow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(220, 38, 38, 0);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s infinite;
        }
      `}</style>
    </>
  );
};

export default EmergencyIcon;
