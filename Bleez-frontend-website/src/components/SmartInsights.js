import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Brain, TrendingUp, MapPin, Compass, Lightbulb, 
  Heart, Globe, Clock, Users, Sparkles, RefreshCw,
  ChevronRight, Award, Target, Zap
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SmartInsights = ({ variant = 'card' }) => {
  const { user, token } = useAuth();
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (user && token) {
      fetchIntelligence();
    }
  }, [user, token]);

  const fetchIntelligence = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/profile/intelligence`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIntelligence(response.data);
    } catch (error) {
      console.error('Failed to fetch intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  const getArchetypeIcon = (archetype) => {
    const icons = {
      'foodie': '🍽️',
      'culture_buff': '🏛️',
      'adventurer': '⛰️',
      'relaxer': '🏖️',
      'nightlife_lover': '🌃',
      'explorer': '🧭'
    };
    return icons[archetype] || '✨';
  };

  const getConfidenceColor = (level) => {
    switch (level) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-amber-500';
      default: return 'text-blue-500';
    }
  };

  if (!user) return null;

  if (loading && !intelligence) {
    return (
      <div className={cn(
        "p-6 rounded-2xl glass border border-white/10",
        variant === 'compact' && "p-4"
      )}>
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-primary" />
          <span className="text-muted-foreground">Analyzing your travel patterns...</span>
        </div>
      </div>
    );
  }

  if (!intelligence) return null;

  const { learned_preferences, recommendations, insights } = intelligence;
  const archetype = learned_preferences?.traveler_archetype;
  const confidence = recommendations?.confidence_level || 'learning';

  // Compact variant for sidebar/widget
  if (variant === 'compact') {
    return (
      <div className="p-4 rounded-xl glass border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Smart Profile</span>
          </div>
          <span className={cn("text-xs", getConfidenceColor(confidence))}>
            {confidence === 'high' ? '●' : confidence === 'medium' ? '◐' : '○'} {confidence}
          </span>
        </div>
        
        {archetype && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{getArchetypeIcon(archetype)}</span>
            <span className="text-sm capitalize">{archetype.replace('_', ' ')}</span>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          {insights?.trips_planned || 0} trips analyzed
        </div>
      </div>
    );
  }

  // Full card variant
  return (
    <div className="rounded-2xl glass border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center">
              <Brain className="w-6 h-6 text-background" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Smart Profile Intelligence</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered insights from your travel patterns
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchIntelligence}
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Traveler Archetype */}
      {archetype && (
        <div className="p-6 border-b border-white/10 bg-primary/5">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{getArchetypeIcon(archetype)}</div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Traveler Type</p>
              <h4 className="text-xl font-semibold capitalize">
                {archetype.replace('_', ' ')}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn("text-xs", getConfidenceColor(confidence))}>
                  {confidence === 'high' ? 'High confidence' : confidence === 'medium' ? 'Learning more' : 'Just started'}
                </span>
                <span className="text-xs text-muted-foreground">
                  • Based on {insights?.trips_planned || 0} trips
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 border-b border-white/10">
        <div className="p-4 text-center border-r border-white/10">
          <p className="text-2xl font-bold text-primary">{insights?.trips_planned || 0}</p>
          <p className="text-xs text-muted-foreground">Trips Planned</p>
        </div>
        <div className="p-4 text-center border-r border-white/10">
          <p className="text-2xl font-bold text-primary">
            {learned_preferences?.visited_destinations?.length || 0}
          </p>
          <p className="text-xs text-muted-foreground">Destinations</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{insights?.chat_interactions || 0}</p>
          <p className="text-xs text-muted-foreground">AI Chats</p>
        </div>
      </div>

      {/* Learned Patterns */}
      <div className="p-6 space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          What We've Learned
        </h4>

        {/* Favorite Regions */}
        {learned_preferences?.favorite_regions?.length > 0 && (
          <div className="flex items-start gap-3">
            <Globe className="w-4 h-4 text-blue-500 mt-1" />
            <div>
              <p className="text-sm font-medium">Favorite Regions</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {learned_preferences.favorite_regions.map((region, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                    {region}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Trip Duration Preference */}
        {learned_preferences?.preferred_trip_duration && (
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-green-500 mt-1" />
            <div>
              <p className="text-sm font-medium">Preferred Trip Length</p>
              <p className="text-xs text-muted-foreground">
                ~{learned_preferences.preferred_trip_duration} days
              </p>
            </div>
          </div>
        )}

        {/* Top Activities */}
        {learned_preferences?.activity_scores && Object.keys(learned_preferences.activity_scores).length > 0 && (
          <div className="flex items-start gap-3">
            <Heart className="w-4 h-4 text-red-500 mt-1" />
            <div>
              <p className="text-sm font-medium">Top Interests</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.entries(learned_preferences.activity_scores)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 4)
                  .map(([activity, score], idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full capitalize"
                    >
                      {activity.replace('_', ' ')}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Climate Preference */}
        {learned_preferences?.preferred_climate && (
          <div className="flex items-start gap-3">
            <Compass className="w-4 h-4 text-purple-500 mt-1" />
            <div>
              <p className="text-sm font-medium">Climate Preference</p>
              <p className="text-xs text-muted-foreground capitalize">
                {learned_preferences.preferred_climate}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations?.suggested_destinations?.length > 0 && (
        <div className="p-6 border-t border-white/10 bg-gradient-to-b from-primary/5 to-transparent">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            Recommended For You
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            {recommendations.suggested_destinations.slice(0, 4).map((dest, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{dest}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>

          {/* Travel Tips */}
          {recommendations?.travel_tips?.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-500 mt-0.5" />
                <p className="text-sm text-amber-200">
                  {recommendations.travel_tips[0]}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!archetype && insights?.trips_planned === 0 && (
        <div className="p-8 text-center">
          <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h4 className="font-medium mb-2">Start Your Journey</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Plan your first trip and we'll start learning your preferences to give you personalized recommendations.
          </p>
          <Button className="btn-primary gap-2">
            <Compass className="w-4 h-4" />
            Plan a Trip
          </Button>
        </div>
      )}
    </div>
  );
};

export default SmartInsights;
