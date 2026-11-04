import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { IMG } from '../data/travelImages';
import { Navbar, Footer } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { 
  Plane, Hotel, Utensils, Search, ExternalLink, Star, 
  Calendar as CalendarIcon, Users, MapPin, TrendingDown,
  Loader2, ArrowRight, Check, Filter, Train, Bus, Car,
  Clock, ArrowRightLeft, CircleDot
} from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { cn } from '../lib/utils';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const { formatAmount, currencySymbol, currency } = useCurrency();
  const [activeTab, setActiveTab] = useState('flights');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [flightResults, setFlightResults] = useState(null);
  
  // Search params
  const [searchParams, setSearchParams] = useState({
    origin: 'New York',
    destination: location.state?.destination || '',
    checkIn: null,
    checkOut: null,
    guests: 2,
    rooms: 1,
    cuisine: '',
    priceRange: 'mid-range'
  });

  const searchFlights = async () => {
    if (!searchParams.origin || !searchParams.destination) {
      toast.error('Please enter origin and destination');
      return;
    }
    
    setLoading(true);
    try {
      const departureDate = searchParams.checkIn 
        ? format(searchParams.checkIn, 'yyyy-MM-dd')
        : format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      
      const response = await axios.post(`${API}/flights/search`, {
        origin: searchParams.origin,
        destination: searchParams.destination,
        departure_date: departureDate,
        adults: searchParams.guests || 1
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      setFlightResults(response.data);
      setResults([]); // Clear generic results
      toast.success(`Found ${response.data.total_results} flights!`);
    } catch (error) {
      console.error('Flight search error:', error);
      toast.error('Failed to search flights. Using estimated prices.');
      // Fallback to booking search
      searchBookings('flight');
    } finally {
      setLoading(false);
    }
  };

  const searchBookings = async (type) => {
    if (!searchParams.destination) {
      toast.error('Please enter a destination');
      return;
    }
    
    setLoading(true);
    setFlightResults(null); // Clear flight results
    try {
      const response = await axios.post(`${API}/booking/search`, {
        type,
        destination: searchParams.destination,
        check_in: searchParams.checkIn ? format(searchParams.checkIn, 'yyyy-MM-dd') : null,
        check_out: searchParams.checkOut ? format(searchParams.checkOut, 'yyyy-MM-dd') : null,
        guests: searchParams.guests,
        rooms: searchParams.rooms,
        cuisine: searchParams.cuisine,
        price_range: searchParams.priceRange
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      setResults(response.data);
    } catch (error) {
      toast.error('Failed to search bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (activeTab === 'flights') {
      searchFlights();
    } else {
      const typeMap = {
        'hotels': 'hotel',
        'transport': 'transport',
        'restaurants': 'restaurant'
      };
      searchBookings(typeMap[activeTab] || 'hotel');
    }
  };

  // Find lowest price
  const lowestPrice = results.length > 0 
    ? Math.min(...results.filter(r => r.price > 0).map(r => r.price))
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <PageHero image={IMG.plane(1600)} eyebrow="Book travel" title="Compare & book your trip" subtitle="Flights, hotels, transport and restaurants in one place." />
      
      <main className="flex-1 pt-10 pb-16">
        <div className="container-main">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-serif mb-4">
              Compare & <span className="gold-text">Book</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find the best prices across multiple platforms. We show you the lowest prices first.
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-lg mx-auto glass-card p-1">
              <TabsTrigger value="flights" className="data-[state=active]:bg-primary flex items-center gap-2">
                <Plane className="w-4 h-4" /> Flights
              </TabsTrigger>
              <TabsTrigger value="hotels" className="data-[state=active]:bg-primary flex items-center gap-2">
                <Hotel className="w-4 h-4" /> Hotels
              </TabsTrigger>
              <TabsTrigger value="transport" className="data-[state=active]:bg-primary flex items-center gap-2">
                <Train className="w-4 h-4" /> Transport
              </TabsTrigger>
              <TabsTrigger value="restaurants" className="data-[state=active]:bg-primary flex items-center gap-2">
                <Utensils className="w-4 h-4" /> Restaurants
              </TabsTrigger>
            </TabsList>

            {/* Search Form */}
            <div className="glass-card p-6 rounded-2xl">
              <div className="grid md:grid-cols-4 gap-4">
                {/* Origin (for flights) */}
                {activeTab === 'flights' && (
                  <div className="space-y-2">
                    <Label>From</Label>
                    <div className="relative">
                      <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={searchParams.origin}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, origin: e.target.value }))}
                        placeholder="Departure city"
                        className="pl-10 bg-white/5"
                      />
                    </div>
                  </div>
                )}

                {/* Destination */}
                <div className="space-y-2">
                  <Label>{activeTab === 'flights' ? 'To' : 'Destination'}</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={searchParams.destination}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, destination: e.target.value }))}
                      placeholder="Where to?"
                      className="pl-10 bg-white/5"
                    />
                  </div>
                </div>

                {/* Check-in Date */}
                <div className="space-y-2">
                  <Label>{activeTab === 'restaurants' ? 'Date' : activeTab === 'transport' ? 'Travel Date' : activeTab === 'flights' ? 'Departure' : 'Check-in'}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start bg-white/5 border-white/10">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {searchParams.checkIn ? format(searchParams.checkIn, 'MMM dd, yyyy') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={searchParams.checkIn}
                        onSelect={(date) => setSearchParams(prev => ({ ...prev, checkIn: date }))}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Check-out Date (for hotels) */}
                {activeTab === 'hotels' && (
                  <div className="space-y-2">
                    <Label>Check-out</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start bg-white/5 border-white/10">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {searchParams.checkOut ? format(searchParams.checkOut, 'MMM dd, yyyy') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={searchParams.checkOut}
                          onSelect={(date) => setSearchParams(prev => ({ ...prev, checkOut: date }))}
                          disabled={(date) => date <= (searchParams.checkIn || new Date())}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {/* Passengers/Guests */}
                <div className="space-y-2">
                  <Label>{activeTab === 'transport' ? 'Passengers' : 'Guests'}</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={searchParams.guests}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, guests: parseInt(e.target.value) || 1 }))}
                      className="pl-10 bg-white/5"
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSearch} 
                disabled={loading}
                className="btn-primary mt-6 w-full md:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search {activeTab}
                  </>
                )}
              </Button>
            </div>

            {/* Real Flight Results */}
            {flightResults && flightResults.flights && flightResults.flights.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    {flightResults.total_results} Flights Found
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      {flightResults.origin} → {flightResults.destination}
                    </span>
                  </h2>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-400">
                      {flightResults.direct_flights_count} direct
                    </span>
                    <span className="text-muted-foreground">
                      {flightResults.connecting_flights_count} with stops
                    </span>
                  </div>
                </div>

                {/* Lowest Price Banner - Integrated inline */}
                {flightResults.lowest_price && (
                  <div className="p-3 sm:p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                          <TrendingDown className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm sm:text-base">Lowest Price Available</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {flightResults.lowest_direct_price 
                              ? `Direct from $${flightResults.lowest_direct_price}` 
                              : 'No direct flights - showing connections'}
                          </p>
                        </div>
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-green-400 text-right sm:text-left">${flightResults.lowest_price}</p>
                    </div>
                  </div>
                )}

                {/* Flight Cards */}
                <div className="grid gap-4">
                  {flightResults.flights.map((flight, index) => (
                    <a
                      key={flight.id || index}
                      href={flight.booking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "glass-card p-4 sm:p-6 rounded-2xl transition-all hover:scale-[1.01] hover:border-primary/50",
                        index === 0 && "border-green-500/50 bg-green-500/5"
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                        {/* Airline Icon - Hidden on mobile, shown on desktop */}
                        <div className="hidden sm:flex w-16 h-16 rounded-xl bg-white/10 flex-col items-center justify-center shrink-0">
                          <Plane className="w-6 h-6 text-primary" />
                          <span className="text-xs text-muted-foreground mt-1">
                            {flight.segments[0]?.airline_code}
                          </span>
                        </div>

                        {/* Flight Details */}
                        <div className="flex-1 min-w-0">
                          {/* Header with airline and badges */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <h3 className="font-semibold text-sm sm:text-base">{flight.validating_airline}</h3>
                            {flight.is_direct ? (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                Direct
                              </span>
                            ) : (
                              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                                {flight.stops} stop{flight.stops > 1 ? 's' : ''}
                              </span>
                            )}
                            {index === 0 && (
                              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                <TrendingDown className="w-3 h-3" /> Best Price
                              </span>
                            )}
                          </div>

                          {/* Flight Path Visualization */}
                          <div className="flex items-center gap-2 sm:gap-4 mb-3">
                            <div className="text-center min-w-[50px]">
                              <p className="text-base sm:text-lg font-bold">{flight.departure_time?.split('T')[1]?.slice(0, 5)}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">{flight.departure_airport}</p>
                            </div>
                            
                            <div className="flex-1 flex items-center gap-1 sm:gap-2 overflow-hidden">
                              <div className="h-px flex-1 bg-white/20" />
                              {flight.connections && flight.connections.slice(0, 2).map((conn, idx) => (
                                <div key={idx} className="flex items-center gap-1 shrink-0">
                                  <CircleDot className="w-3 h-3 text-yellow-400" />
                                  <span className="text-xs text-yellow-400 hidden sm:inline">{conn.airport}</span>
                                  <div className="h-px w-2 sm:w-4 bg-white/20" />
                                </div>
                              ))}
                              {flight.is_direct && <Plane className="w-4 h-4 text-primary shrink-0" />}
                              <div className="h-px flex-1 bg-white/20" />
                            </div>
                            
                            <div className="text-center min-w-[50px]">
                              <p className="text-base sm:text-lg font-bold">{flight.arrival_time?.split('T')[1]?.slice(0, 5)}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">{flight.arrival_airport}</p>
                            </div>
                          </div>

                          {/* Duration & Segments */}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {flight.total_duration}
                            </span>
                            {flight.segments?.slice(0, 2).map((seg, idx) => (
                              <span key={idx} className="hidden sm:flex items-center gap-1">
                                {seg.flight_number}
                              </span>
                            ))}
                            <span className="capitalize">{flight.booking_class?.toLowerCase()}</span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className={cn(
                            "font-bold",
                            index === 0 
                              ? "text-3xl text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" 
                              : "text-2xl text-white"
                          )}>
                            {formatAmount(flight.price, flight.currency || 'EUR')}
                            {index === 0 && <span className="ml-1 text-xs font-normal text-green-300">★</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">per person • {currency}</p>
                          <Button size="sm" className={cn(
                            "mt-2 gap-1",
                            index === 0 && "bg-green-600 hover:bg-green-700"
                          )}>
                            Book Now <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Generic Results (Hotels, Transport, Restaurants) */}
            {results.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    {results.length} Results Found
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <TrendingDown className="w-4 h-4" />
                    Sorted by lowest price
                  </div>
                </div>

                <div className="grid gap-4">
                  {results.map((result, index) => (
                    <a
                      key={index}
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "glass-card p-4 sm:p-6 rounded-2xl transition-all hover:scale-[1.01] hover:border-primary/50",
                        result.is_lowest && "border-green-500/50 bg-green-500/5"
                      )}
                    >
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                        {/* Image */}
                        <div className="flex items-start gap-4 sm:gap-0">
                          {result.image ? (
                            <img 
                              src={result.image} 
                              alt={result.name}
                              className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                              {activeTab === 'flights' && <Plane className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />}
                              {activeTab === 'hotels' && <Hotel className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />}
                              {activeTab === 'restaurants' && <Utensils className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />}
                              {activeTab === 'transport' && (
                                result.details?.transport_type === 'train' ? <Train className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" /> :
                                result.details?.transport_type === 'bus' ? <Bus className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" /> :
                                <Car className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                              )}
                            </div>
                          )}
                          
                          {/* Mobile Price - visible only on small screens */}
                          <div className="sm:hidden text-right flex-1">
                            {result.price > 0 ? (
                              <p className={cn(
                                "font-bold text-xl",
                                result.is_lowest ? "text-green-400" : "text-white"
                              )}>
                                {formatAmount(result.price, result.currency || 'USD')}
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">View prices</p>
                            )}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="text-base sm:text-lg font-semibold truncate">{result.name}</h3>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                {result.is_lowest && (
                                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <TrendingDown className="w-3 h-3" /> Lowest Price
                                  </span>
                                )}
                                <p className="text-sm text-muted-foreground">{result.provider}</p>
                              </div>
                            </div>
                            
                            {result.rating && (
                              <div className="flex items-center gap-1 text-yellow-400 shrink-0">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="font-medium">{result.rating}</span>
                              </div>
                            )}
                          </div>

                          {result.details && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              {result.details.note && <p className="line-clamp-1">{result.details.note}</p>}
                              {result.details.address && <p className="flex items-center gap-1 line-clamp-1"><MapPin className="w-3 h-3 shrink-0" /> {result.details.address}</p>}
                              {result.details.food_preference_match && (
                                <p className="text-green-400 flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Matches your {result.details.food_preference_match} preference
                                </p>
                              )}
                            </div>
                          )}
                          
                          {/* Mobile Book Button */}
                          <Button 
                            size="sm" 
                            className={cn(
                              "mt-3 w-full sm:hidden gap-1",
                              result.is_lowest && "bg-green-600 hover:bg-green-700"
                            )}
                          >
                            Book Now <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Desktop Price & CTA - hidden on mobile */}
                        <div className="hidden sm:block text-right shrink-0">
                          {result.price > 0 ? (
                            <>
                              <p className={cn(
                                "font-bold",
                                result.is_lowest 
                                  ? "text-3xl text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" 
                                  : "text-2xl text-white"
                              )}>
                                {formatAmount(result.price, result.currency || 'USD')}
                                {result.is_lowest && (
                                  <span className="ml-1 text-xs font-normal text-green-300">★</span>
                                )}
                              </p>
                              <p className={cn(
                                "text-xs",
                                result.is_lowest ? "text-green-300/80" : "text-muted-foreground"
                              )}>
                                {currency}
                              </p>
                            </>
                          ) : (
                            <p className="text-muted-foreground">View prices</p>
                          )}
                          <Button 
                            size="sm" 
                            className={cn(
                              "mt-2 gap-1",
                              result.is_lowest && "bg-green-600 hover:bg-green-700"
                            )}
                          >
                            Book Now <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {results.length === 0 && !flightResults && !loading && (
              <div className="text-center py-16 glass-card rounded-2xl">
                <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Search for the best deals</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {activeTab === 'flights' 
                    ? 'Enter your origin, destination, and travel date to find real flight prices with direct and connecting options.'
                    : 'Enter your destination and travel dates to compare prices across multiple booking platforms.'}
                </p>
              </div>
            )}
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;
