import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageHero from '../components/PageHero';
import { IMG } from '../data/travelImages';
import { Navbar, Footer } from '../components/Layout';
import SmartInsights from '../components/SmartInsights';
import CurrencySelector from '../components/CurrencySelector';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Slider } from '../components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  User, Mail, Save, Loader2, Heart, Briefcase,
  Utensils, DollarSign, MapPin, Check, ChevronRight,
  Sparkles, Shield, Brain, Globe, Calendar, Link2, Unlink
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [calendarStatus, setCalendarStatus] = useState({ connected: false, loading: true });
  const [connectingCalendar, setConnectingCalendar] = useState(false);
  
  const [profile, setProfile] = useState({
    age: 30,
    gender: '',
    marital_status: '',
    health_status: 'normal',
    health_considerations: '',
    religion: '',
    travel_type: 'leisure',
    food_preferences: {
      diet_type: 'vegetarian-friendly',
      allergies: [],
      restrictions: []
    },
    budget_preferences: {
      daily_budget_min: 100,
      daily_budget_max: 300,
      total_trip_budget: null,
      trip_budget_preference: 'mid-range'
    },
    travel_interests: [],
    is_business_traveler: false,
    chat_opt_in: false
  });

  useEffect(() => {
    if (!token && !user) {
      navigate('/login');
      return;
    }
    if (user?.profile) {
      setProfile(prev => ({
        ...prev,
        ...user.profile,
        food_preferences: {
          ...prev.food_preferences,
          ...(user.profile.food_preferences || {})
        },
        budget_preferences: {
          ...prev.budget_preferences,
          ...(user.profile.budget_preferences || {})
        }
      }));
    }
  }, [user, token, navigate]);

  const dietTypes = [
    { id: 'vegetarian', label: 'Vegetarian', description: 'No meat or fish' },
    { id: 'non-vegetarian', label: 'Non-Vegetarian', description: 'All foods' },
    { id: 'vegan', label: 'Vegan', description: 'No animal products' },
    { id: 'halal', label: 'Halal', description: 'Islamic dietary laws' },
    { id: 'kosher', label: 'Kosher', description: 'Jewish dietary laws' },
    { id: 'jain', label: 'Jain', description: 'No root vegetables' },
    { id: 'vegetarian-friendly', label: 'Flexible', description: 'Prefer veg, occasional non-veg OK' }
  ];

  const religions = [
    { id: 'none', label: 'Prefer not to say' },
    { id: 'hindu', label: 'Hindu' },
    { id: 'muslim', label: 'Muslim' },
    { id: 'christian', label: 'Christian' },
    { id: 'buddhist', label: 'Buddhist' },
    { id: 'jewish', label: 'Jewish' },
    { id: 'sikh', label: 'Sikh' },
    { id: 'jain', label: 'Jain' },
    { id: 'other', label: 'Other' }
  ];

  const travelTypes = [
    { id: 'leisure', label: 'Leisure', icon: '🏖️', description: 'Relaxation & exploration' },
    { id: 'adventure', label: 'Adventure', icon: '🧗', description: 'Thrilling activities' },
    { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', description: 'Kid-friendly trips' },
    { id: 'luxury', label: 'Luxury', icon: '✨', description: 'Premium experiences' },
    { id: 'business', label: 'Business', icon: '💼', description: 'Work travel' },
    { id: 'spiritual', label: 'Spiritual', icon: '🕉️', description: 'Religious & wellness' }
  ];

  const interests = [
    { id: 'sightseeing', label: 'Sightseeing', icon: '📸' },
    { id: 'nature', label: 'Nature', icon: '🌲' },
    { id: 'history', label: 'History', icon: '🏛️' },
    { id: 'food', label: 'Food & Dining', icon: '🍽️' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'nightlife', label: 'Nightlife', icon: '🌃' },
    { id: 'spirituality', label: 'Spirituality', icon: '🙏' },
    { id: 'local_culture', label: 'Local Culture', icon: '🎭' },
    { id: 'workspaces', label: 'Workspaces', icon: '💻' },
    { id: 'art', label: 'Art & Museums', icon: '🎨' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'wellness', label: 'Wellness & Spa', icon: '🧘' }
  ];

  const healthOptions = [
    { id: 'normal', label: 'Normal mobility' },
    { id: 'limited_mobility', label: 'Limited mobility' },
    { id: 'wheelchair', label: 'Wheelchair user' },
    { id: 'senior', label: 'Senior traveler' },
    { id: 'pregnant', label: 'Pregnant' }
  ];

  const budgetOptions = [
    { id: 'budget', label: 'Budget', description: 'Hostels, street food, public transport', range: '$50-100/day' },
    { id: 'mid-range', label: 'Mid-Range', description: '3-star hotels, local restaurants', range: '$100-250/day' },
    { id: 'luxury', label: 'Luxury', description: '5-star hotels, fine dining', range: '$250+/day' }
  ];

  // Check for calendar connection callback params
  useEffect(() => {
    const calendarConnected = searchParams.get('calendar_connected');
    const calendarError = searchParams.get('calendar_error');
    
    if (calendarConnected === 'true') {
      toast.success('Google Calendar connected successfully!');
      setCalendarStatus({ connected: true, loading: false });
      // Clean URL
      navigate('/profile', { replace: true });
    } else if (calendarError) {
      const errorMessages = {
        'expired': 'Connection expired. Please try again.',
        'invalid_state': 'Invalid request. Please try again.',
        'token_exchange_failed': 'Failed to connect. Please try again.',
        'server_error': 'Server error. Please try again later.',
        'access_denied': 'Access denied. Calendar permission is required.'
      };
      toast.error(errorMessages[calendarError] || 'Failed to connect Google Calendar');
      navigate('/profile', { replace: true });
    }
  }, [searchParams, navigate]);

  // Fetch calendar status
  useEffect(() => {
    const fetchCalendarStatus = async () => {
      if (!token) return;
      
      try {
        const response = await axios.get(`${API}/auth/google-calendar/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setCalendarStatus({ ...response.data, loading: false });
      } catch (error) {
        setCalendarStatus({ connected: false, loading: false });
      }
    };
    
    fetchCalendarStatus();
  }, [token]);

  // Connect Google Calendar
  const connectGoogleCalendar = async () => {
    setConnectingCalendar(true);
    try {
      const response = await axios.get(`${API}/auth/google-calendar/connect`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else {
        toast.error('Failed to initiate connection');
        setConnectingCalendar(false);
      }
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to connect Google Calendar';
      toast.error(message);
      setConnectingCalendar(false);
    }
  };

  // Disconnect Google Calendar
  const disconnectGoogleCalendar = async () => {
    try {
      await axios.delete(`${API}/auth/google-calendar/disconnect`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCalendarStatus({ connected: false, loading: false });
      toast.success('Google Calendar disconnected');
    } catch (error) {
      toast.error('Failed to disconnect calendar');
    }
  };

  const toggleInterest = (interest) => {
    setProfile(prev => ({
      ...prev,
      travel_interests: prev.travel_interests.includes(interest)
        ? prev.travel_interests.filter(i => i !== interest)
        : [...prev.travel_interests, interest]
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile(profile);
      toast.success('Profile saved successfully!');
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col overflow-x-hidden" data-testid="profile-page">
      <Navbar />
      <PageHero image={IMG.alpine(1600)} eyebrow="Profile" title="Your travel profile" subtitle="Preferences that help AI personalize every trip." />
      
      <main className="flex-1 pt-10 sm:pt-24 pb-24 sm:pb-16">
        <div className="container-main">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                {user?.picture ? (
                  <img src={user.picture} alt="" className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover" />
                ) : (
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-serif truncate">{user?.name || 'Traveler'}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2 truncate">
                  <Mail className="w-4 h-4 shrink-0" /> <span className="truncate">{user?.email}</span>
                </p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Your profile helps us personalize itineraries, restaurant suggestions, and religious place recommendations.
            </p>
          </div>

          {/* Profile Form */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            {/* Scrollable Tabs for Mobile, Centered for Desktop */}
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
              <TabsList className="inline-flex w-max gap-1 sm:flex sm:justify-center sm:w-full sm:max-w-4xl sm:mx-auto glass-card p-1.5 rounded-xl">
                <TabsTrigger 
                  value="personal" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap px-4 py-2 text-xs sm:text-sm rounded-lg transition-all"
                >
                  <User className="w-3.5 h-3.5 mr-1.5 sm:mr-2" />
                  Personal
                </TabsTrigger>
                <TabsTrigger 
                  value="preferences" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap px-4 py-2 text-xs sm:text-sm rounded-lg transition-all"
                >
                  <Heart className="w-3.5 h-3.5 mr-1.5 sm:mr-2" />
                  Preferences
                </TabsTrigger>
                <TabsTrigger 
                  value="food" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap px-4 py-2 text-xs sm:text-sm rounded-lg transition-all"
                >
                  <Utensils className="w-3.5 h-3.5 mr-1.5 sm:mr-2" />
                  Food
                </TabsTrigger>
                <TabsTrigger 
                  value="budget" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap px-4 py-2 text-xs sm:text-sm rounded-lg transition-all"
                >
                  <DollarSign className="w-3.5 h-3.5 mr-1.5 sm:mr-2" />
                  Budget
                </TabsTrigger>
                <TabsTrigger 
                  value="integrations" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap px-4 py-2 text-xs sm:text-sm rounded-lg transition-all"
                >
                  <Link2 className="w-3.5 h-3.5 mr-1.5 sm:mr-2" />
                  Links
                </TabsTrigger>
                <TabsTrigger 
                  value="intelligence" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap px-4 py-2 text-xs sm:text-sm rounded-lg transition-all"
                >
                  <Brain className="w-3.5 h-3.5 mr-1.5 sm:mr-2" />
                  Insights
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Personal Tab */}
            <TabsContent value="personal" className="space-y-4 sm:space-y-6">
              <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-4 sm:space-y-6">
                <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Personal Information
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm">Age</Label>
                    <Input
                      type="number"
                      value={profile.age || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || null }))}
                      placeholder="Your age"
                      className="bg-white/5 h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">Gender</Label>
                    <Select value={profile.gender} onValueChange={(v) => setProfile(prev => ({ ...prev, gender: v }))}>
                      <SelectTrigger className="bg-white/5 h-11">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Marital Status</Label>
                    <Select value={profile.marital_status} onValueChange={(v) => setProfile(prev => ({ ...prev, marital_status: v }))}>
                      <SelectTrigger className="bg-white/5 h-11">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="partner">With Partner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Religion (for religious place suggestions)</Label>
                    <Select value={profile.religion || 'none'} onValueChange={(v) => setProfile(prev => ({ ...prev, religion: v === 'none' ? null : v }))}>
                      <SelectTrigger className="bg-white/5">
                        <SelectValue placeholder="Select religion" />
                      </SelectTrigger>
                      <SelectContent>
                        {religions.map(r => (
                          <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">We'll suggest temples, mosques, churches etc. based on this</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Health Status</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {healthOptions.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setProfile(prev => ({ ...prev, health_status: opt.id }))}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all",
                          profile.health_status === opt.id
                            ? "border-primary bg-primary/10"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        )}
                      >
                        <p className="font-medium">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Health Considerations (Optional)</Label>
                  <Textarea
                    value={profile.health_considerations || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, health_considerations: e.target.value }))}
                    placeholder="Any medical conditions or accessibility needs..."
                    className="bg-white/5"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-4 sm:space-y-6">
              <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-4 sm:space-y-6">
                <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary shrink-0" /> Travel Preferences
                </h2>
                
                <div className="space-y-4">
                  <Label>Travel Type</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {travelTypes.map(type => (
                      <button
                        key={type.id}
                        onClick={() => setProfile(prev => ({ ...prev, travel_type: type.id }))}
                        className={cn(
                          "p-4 rounded-xl border text-left transition-all",
                          profile.travel_type === type.id
                            ? "border-primary bg-primary/10 neon-glow"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        )}
                      >
                        <span className="text-2xl mb-2 block">{type.icon}</span>
                        <p className="font-medium">{type.label}</p>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Interests (Select all that apply)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {interests.map(interest => (
                      <button
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all flex items-center gap-2",
                          profile.travel_interests?.includes(interest.id)
                            ? "border-primary bg-primary/10"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        )}
                      >
                        <span>{interest.icon}</span>
                        <span className="font-medium text-sm">{interest.label}</span>
                        {profile.travel_interests?.includes(interest.id) && (
                          <Check className="w-4 h-4 text-primary ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
                  <Checkbox
                    checked={profile.is_business_traveler}
                    onCheckedChange={(checked) => setProfile(prev => ({ ...prev, is_business_traveler: checked }))}
                  />
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> I'm a Business Traveler
                    </p>
                    <p className="text-sm text-muted-foreground">Get business-focused itineraries with meeting schedules</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Food Tab */}
            <TabsContent value="food" className="space-y-4 sm:space-y-6">
              <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-4 sm:space-y-6">
                <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-primary shrink-0" /> Food Preferences
                </h2>
                
                <div className="space-y-4">
                  <Label>Diet Type</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    {dietTypes.map(diet => (
                      <button
                        key={diet.id}
                        onClick={() => setProfile(prev => ({
                          ...prev,
                          food_preferences: { ...prev.food_preferences, diet_type: diet.id }
                        }))}
                        className={cn(
                          "p-4 rounded-xl border text-left transition-all",
                          profile.food_preferences?.diet_type === diet.id
                            ? "border-primary bg-primary/10 neon-glow"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        )}
                      >
                        <p className="font-medium">{diet.label}</p>
                        <p className="text-sm text-muted-foreground">{diet.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>We'll suggest restaurants matching your <strong>{profile.food_preferences?.diet_type || 'dietary'}</strong> preferences during trip planning.</span>
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Budget Tab */}
            <TabsContent value="budget" className="space-y-4 sm:space-y-6">
              <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-4 sm:space-y-6">
                <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary shrink-0" /> Budget Preferences
                </h2>
                
                {/* Currency Selection */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <CurrencySelector showLabel={true} />
                  <p className="text-xs text-muted-foreground mt-2">
                    All prices in the app will be displayed in your preferred currency
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Label>Budget Level</Label>
                  <div className="grid md:grid-cols-3 gap-4">
                    {budgetOptions.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setProfile(prev => ({
                          ...prev,
                          budget_preferences: { ...prev.budget_preferences, trip_budget_preference: opt.id }
                        }))}
                        className={cn(
                          "p-4 rounded-xl border text-left transition-all",
                          profile.budget_preferences?.trip_budget_preference === opt.id
                            ? "border-primary bg-primary/10 neon-glow"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        )}
                      >
                        <p className="font-medium">{opt.label}</p>
                        <p className="text-sm text-muted-foreground">{opt.description}</p>
                        <p className="text-xs text-primary mt-2">{opt.range}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Daily Budget Min ($)</Label>
                    <Input
                      type="number"
                      value={profile.budget_preferences?.daily_budget_min || 100}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        budget_preferences: { ...prev.budget_preferences, daily_budget_min: parseInt(e.target.value) || 0 }
                      }))}
                      className="bg-white/5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Daily Budget Max ($)</Label>
                    <Input
                      type="number"
                      value={profile.budget_preferences?.daily_budget_max || 300}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        budget_preferences: { ...prev.budget_preferences, daily_budget_max: parseInt(e.target.value) || 0 }
                      }))}
                      className="bg-white/5"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Integrations Tab */}
            <TabsContent value="integrations" className="space-y-4 sm:space-y-6">
              <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-4 sm:space-y-6">
                <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-primary shrink-0" /> Connected Services
                </h2>
                <p className="text-sm text-muted-foreground">
                  Connect external services to enhance your travel experience.
                </p>

                {/* Google Calendar Integration */}
                <div className="p-3 sm:p-4 rounded-xl border border-white/10 bg-white/5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium flex items-center gap-2 flex-wrap">
                          <span>Google Calendar</span>
                          {calendarStatus.connected && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                              Connected
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Sync your trip itineraries directly to Google Calendar
                        </p>
                        {calendarStatus.connected && calendarStatus.connected_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Connected on {new Date(calendarStatus.connected_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 sm:mt-0">
                      {calendarStatus.loading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      ) : calendarStatus.connected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={disconnectGoogleCalendar}
                          className="text-destructive border-destructive/30 hover:bg-destructive/10 w-full sm:w-auto"
                          data-testid="btn-disconnect-calendar"
                        >
                          <Unlink className="w-4 h-4 mr-2" />
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          onClick={connectGoogleCalendar}
                          disabled={connectingCalendar}
                          className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
                          data-testid="btn-connect-calendar"
                        >
                          {connectingCalendar ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <Link2 className="w-4 h-4 mr-2" />
                              Connect
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Features list */}
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10">
                    <p className="text-xs text-muted-foreground mb-2">Features:</p>
                    <ul className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <li className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-green-400" />
                        Auto-sync trip events
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-green-400" />
                        Meeting reminders
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-green-400" />
                        Activity schedules
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-green-400" />
                        Color-coded events
                      </li>
                    </ul>
                  </div>
                  
                  {/* Setup instructions if not configured */}
                  {!calendarStatus.connected && (
                    <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-xs text-amber-400">
                        <strong>Note:</strong> Google Calendar integration requires admin setup. 
                        If the Connect button shows an error, please contact support or use the 
                        "Add to Calendar (.ics)" option on your itineraries.
                      </p>
                    </div>
                  )}
                </div>

                {/* Placeholder for future integrations */}
                <div className="p-4 rounded-xl border border-dashed border-white/10 bg-white/2">
                  <p className="text-sm text-muted-foreground text-center">
                    More integrations coming soon: Apple Calendar, Outlook, Google Drive
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* AI Intelligence Tab */}
            <TabsContent value="intelligence" className="space-y-4 sm:space-y-6">
              <SmartInsights />
              
              <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary shrink-0" />
                  How Smart Profile Works
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Learning from your trips:</strong> Every itinerary you create helps us understand your travel style, preferred destinations, and favorite activities.
                  </p>
                  <p>
                    <strong className="text-foreground">Chat analysis:</strong> Your conversations with our AI assistant reveal preferences about climate, accommodation, and travel pace.
                  </p>
                  <p>
                    <strong className="text-foreground">Personalized recommendations:</strong> The more you use Bleez, the better our suggestions become - from destinations to activities to dining options.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Save Button - Fixed on mobile, regular on desktop */}
          <div className="fixed sm:relative bottom-0 left-0 right-0 sm:bottom-auto sm:left-auto sm:right-auto
                          p-4 sm:p-0 bg-background/95 sm:bg-transparent backdrop-blur-lg sm:backdrop-blur-none
                          border-t sm:border-0 border-white/10 z-40 sm:z-auto
                          flex justify-center sm:justify-end mt-0 sm:mt-8"
               style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="btn-primary w-full sm:w-auto px-8 py-5 sm:py-6 text-base sm:text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
