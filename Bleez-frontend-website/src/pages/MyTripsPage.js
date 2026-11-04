import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageHero from '../components/PageHero';
import { IMG } from '../data/travelImages';
import { Navbar, Footer } from '../components/Layout';
import { Button } from '../components/ui/button';
import { 
  MapPin, Calendar, Trash2, ExternalLink, Loader2, 
  Plane, Plus, FolderOpen
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MyTripsPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchTrips();
  }, [token]);

  const fetchTrips = async () => {
    try {
      const response = await axios.get(`${API}/itineraries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrips(response.data);
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    
    try {
      await axios.delete(`${API}/itinerary/${tripId}`);
      setTrips(trips.filter(t => t.id !== tripId));
      toast.success('Trip deleted');
    } catch (error) {
      toast.error('Failed to delete trip');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="trips-loading">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" data-testid="my-trips-page">
      <Navbar />
      <PageHero image={IMG.roadtrip(1600)} eyebrow="My Trips" title="Your journeys" subtitle="Past, ongoing and upcoming trips in one place." />
      
      <main className="flex-1 pt-10 pb-12">
        <div className="container-main">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-2">
                Your Digital Wallet
              </p>
              <h1 className="text-4xl md:text-5xl font-serif tracking-tight">
                My Trips
              </h1>
            </div>
            <Button 
              onClick={() => navigate('/plan')}
              className="btn-primary gap-2"
              data-testid="btn-new-trip"
            >
              <Plus className="w-5 h-5" />
              Plan New Trip
            </Button>
          </div>

          {/* Trips Grid */}
          {trips.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <div 
                  key={trip.id}
                  className="group p-6 rounded-2xl bg-white/5 border border-white/10 
                           hover:border-primary/50 transition-all duration-300 hover-lift"
                  data-testid={`trip-card-${trip.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center">
                      <Plane className="w-6 h-6 text-background" />
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(trip.id); }}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground 
                               hover:text-destructive transition-colors"
                      data-testid={`delete-trip-${trip.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-serif mb-2">{trip.destination}</h3>
                  
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {trip.start_date}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs capitalize">
                      {trip.trip_type}
                    </span>
                  </div>
                  
                  {trip.ai_explanation && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {trip.ai_explanation}
                    </p>
                  )}
                  
                  <Button
                    variant="outline"
                    className="w-full btn-secondary gap-2"
                    onClick={() => navigate(`/itinerary/${trip.id}`)}
                    data-testid={`view-trip-${trip.id}`}
                  >
                    View Itinerary
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                <FolderOpen className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-serif mb-2">No trips yet</h2>
              <p className="text-muted-foreground mb-8">
                Start planning your first adventure with AI
              </p>
              <Button 
                onClick={() => navigate('/plan')}
                className="btn-primary"
                data-testid="btn-plan-first"
              >
                Plan Your First Trip
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MyTripsPage;
