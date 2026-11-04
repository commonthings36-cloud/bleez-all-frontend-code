import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { IMG } from '../data/travelImages';
import { Navbar, Footer } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Plane, Hotel, Car, Ticket, ExternalLink, Star, 
  DollarSign, Shield, Clock, Sparkles, ArrowLeft,
  TrendingDown, Award, Zap, Utensils, Train, Bus,
  MapPin, RefreshCw, Loader2, Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const BookingComparePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { formatAmount, currency } = useCurrency();
  const initialBookingLinks = location.state?.bookingLinks || {};
  const destination = location.state?.destination || '';
  const checkIn = location.state?.checkIn;
  const checkOut = location.state?.checkOut;
  
  const [activeTab, setActiveTab] = useState('flights');
  const [loading, setLoading] = useState(false);
  const [compareData, setCompareData] = useState(null);

  // Fetch real prices on mount
  useEffect(() => {
    if (destination && token) {
      fetchCompareData();
    }
  }, [destination, token]);

  const fetchCompareData = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/booking/compare`, {
        destination,
        check_in: checkIn,
        check_out: checkOut,
        guests: 2
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompareData(response.data);
      toast.success('Real-time prices loaded!');
    } catch (error) {
      console.error('Failed to fetch compare data:', error);
      // Fall back to initial booking links
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { 
      key: 'flights', 
      label: 'Flights', 
      icon: Plane,
      description: 'Compare flight prices across booking platforms'
    },
    { 
      key: 'hotels', 
      label: 'Hotels', 
      icon: Hotel,
      description: 'Find accommodations matching your budget'
    },
    { 
      key: 'restaurants', 
      label: 'Restaurants', 
      icon: Utensils,
      description: 'Dining options based on your food preferences'
    },
    { 
      key: 'transport', 
      label: 'Transport', 
      icon: Car,
      description: 'Local transportation specific to this destination'
    },
    { 
      key: 'activities', 
      label: 'Activities', 
      icon: Ticket,
      description: 'Tours, tickets, and experiences'
    }
  ];

  const getTransportIcon = (type, icon) => {
    // Use emoji icon if provided
    if (icon) {
      return <span className="text-2xl">{icon}</span>;
    }
    switch (type) {
      case 'train': return <Train className="w-5 h-5" />;
      case 'bus': return <Bus className="w-5 h-5" />;
      case 'metro': return <Train className="w-5 h-5" />;
      case 'ride': return <Car className="w-5 h-5" />;
      case 'rideshare': return <Car className="w-5 h-5" />;
      case 'multi': return <MapPin className="w-5 h-5" />;
      case 'local': return <Train className="w-5 h-5" />;
      default: return <Car className="w-5 h-5" />;
    }
  };

  // Get data for current tab
  const getTabData = (tabKey) => {
    if (compareData && compareData[tabKey]) {
      return compareData[tabKey];
    }
    // Fall back to initial booking links
    return initialBookingLinks[tabKey] || [];
  };

  const renderPriceCard = (item, index, type) => {
    const isLowest = item.is_lowest;
    const hasRealPrice = item.price && item.price > 0;
    const isRideService = item.category === 'rides' || item.type === 'ride';
    
    return (
      <a
        key={item.name + index}
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "block p-4 sm:p-6 rounded-2xl glass border border-primary/20 transition-all hover:scale-[1.01] hover:border-primary/50",
          isLowest && "border-green-500/50 bg-green-500/5"
        )}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Image or Icon */}
          <div className={cn(
            "w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shrink-0",
            isLowest ? "bg-green-500/20" : "bg-white/10",
            isRideService && "bg-gradient-to-br from-primary/20 to-purple-500/20"
          )}>
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover" />
            ) : type === 'transport' ? (
              getTransportIcon(item.type, item.icon)
            ) : type === 'restaurants' ? (
              <Utensils className={cn("w-5 h-5 sm:w-6 sm:h-6", isLowest ? "text-green-400" : "text-primary")} />
            ) : type === 'hotels' ? (
              <Hotel className={cn("w-5 h-5 sm:w-6 sm:h-6", isLowest ? "text-green-400" : "text-primary")} />
            ) : type === 'flights' ? (
              <Plane className={cn("w-5 h-5 sm:w-6 sm:h-6", isLowest ? "text-green-400" : "text-primary")} />
            ) : (
              <Ticket className={cn("w-5 h-5 sm:w-6 sm:h-6", isLowest ? "text-green-400" : "text-primary")} />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-base sm:text-lg truncate">{item.name}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {isLowest && (
                    <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full flex items-center gap-1 shrink-0">
                      <TrendingDown className="w-3 h-3" />
                      Lowest Price
                    </span>
                  )}
                  {isRideService && item.category === 'rides' && (
                    <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full shrink-0">
                      Ride Service
                    </span>
                  )}
                </div>
              </div>
              {item.rating && (
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">{item.rating}</span>
                  </div>
                  {/* Rating Source */}
                  <span className="text-[10px] text-muted-foreground">
                    via {item.rating_source || (type === 'restaurants' ? 'Google' : type === 'hotels' ? 'Booking.com' : 'TripAdvisor')}
                  </span>
                </div>
              )}
            </div>
            
            {/* Details */}
            <div className="space-y-1 text-sm text-muted-foreground">
              {item.note && <p>{item.note}</p>}
              {item.available_in && (
                <p className="text-blue-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {item.available_in}
                </p>
              )}
              {item.pickup_hint && (
                <p className="text-green-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> {item.pickup_hint}
                </p>
              )}
              {item.why_recommended && <p>{item.why_recommended}</p>}
              {item.address && (
                <p className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {item.address}
                </p>
              )}
              {item.matches_preference && (
                <p className="text-green-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Matches your {item.matches_preference} preference
                </p>
              )}
              {item.matches_budget && (
                <p className="text-green-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Within your budget range
                </p>
              )}
              {item.is_direct !== undefined && (
                <p className={item.is_direct ? "text-green-400" : "text-yellow-400"}>
                  {item.is_direct ? "✓ Direct flight" : `${item.stops} stop${item.stops > 1 ? 's' : ''}`}
                </p>
              )}
              {item.duration && (
                <p className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {item.duration}
                </p>
              )}
              {item.region_specific && (
                <p className="text-xs text-primary/70">Available in {item.region_specific}</p>
              )}
              {item.source && (
                <p className="text-xs opacity-60">Source: {item.source}</p>
              )}
            </div>
          </div>
          
          {/* Price */}
          <div className="text-right shrink-0">
            {hasRealPrice ? (
              <>
                <p className={cn(
                  "font-bold",
                  isLowest 
                    ? "text-3xl text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" 
                    : "text-2xl"
                )}>
                  {formatAmount(item.price, item.currency || 'USD')}
                  {isLowest && <span className="text-xs ml-1 text-green-300">★</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currency}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">View prices →</p>
            )}
            <Button 
              size="sm" 
              className={cn(
                "mt-3 gap-1",
                isLowest && "bg-green-600 hover:bg-green-700"
              )}
            >
              {hasRealPrice ? 'Book Now' : 'Compare'} 
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        {/* Price insight badge */}
        {item.price_insight && (
          <div className="mt-4 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-xs text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {item.price_insight}
            </p>
          </div>
        )}
        
        {/* Flexibility note */}
        {item.flexibility_note && (
          <div className="mt-2 flex items-center gap-1 text-xs text-blue-400">
            <Shield className="w-3 h-3" /> {item.flexibility_note}
          </div>
        )}
      </a>
    );
  };

  return (
    <div className="min-h-screen flex flex-col" data-testid="booking-compare-page">
      <Navbar />
      <PageHero image={IMG.pool(1600)} eyebrow="Compare" title="Find the best deal" subtitle="Side-by-side prices and options for your journey." />
      
      <main className="flex-1 pt-10 pb-12">
        <div className="container-main">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Itinerary
            </Button>
            
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-serif mb-2">
                  Compare & Book: <span className="gold-text">{destination}</span>
                </h1>
                <p className="text-muted-foreground">
                  Real-time prices sorted by lowest first. Personalized to your preferences.
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={fetchCompareData}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                Refresh Prices
              </Button>
            </div>
          </div>

          {/* AI Price Intelligence Banner */}
          <div className="mb-8 p-4 rounded-xl gold-gradient/10 border border-primary/30">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-semibold">AI Price Intelligence</h3>
                <p className="text-sm text-muted-foreground">
                  Prices fetched in real-time • Sorted by lowest • Matched to your profile preferences
                </p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-muted-foreground">Fetching real-time prices...</p>
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full max-w-2xl mx-auto glass-card p-1">
              {categories.map(cat => (
                <TabsTrigger 
                  key={cat.key} 
                  value={cat.key} 
                  className="data-[state=active]:bg-primary flex items-center gap-1 text-xs md:text-sm"
                >
                  <cat.icon className="w-4 h-4" /> 
                  <span className="hidden md:inline">{cat.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab Contents */}
            {categories.map(cat => (
              <TabsContent key={cat.key} value={cat.key} className="space-y-4">
                <p className="text-muted-foreground text-sm">{cat.description}</p>
                
                {getTabData(cat.key).length > 0 ? (
                  <div className="grid gap-4">
                    {getTabData(cat.key).map((item, idx) => 
                      renderPriceCard(item, idx, cat.key)
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 glass-card rounded-2xl">
                    <cat.icon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      {loading ? 'Loading...' : `No ${cat.label.toLowerCase()} data available`}
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={fetchCompareData}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Load Prices
                    </Button>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BookingComparePage;
