import { CampaignBanner } from '../components/CampaignBanner';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageHero from '../components/PageHero';
import { IMG } from '../data/travelImages';
import { Navbar, Footer } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Switch } from '../components/ui/switch';
import DestinationAutocomplete from '../components/DestinationAutocomplete';
import { 
  MapPin, Calendar as CalendarIcon, Users, Sparkles, Loader2,
  Briefcase, Heart, Mountain, Plane, ChevronRight, Plus, Minus,
  Clock, FileText, Building, X, Check, ArrowLeft, Wallet, Compass, Baby
} from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { useDynamicBackground } from '../contexts/DynamicBackgroundContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PLANNER_STEPS = [
  { n: 1, label: 'Where & When' },
  { n: 2, label: 'Travel Style' },
  { n: 3, label: 'Final Details' },
];

const SectionTitle = ({ n, icon: Icon, title, hint }) => (
  <div className="flex items-start gap-3 mb-4">
    <span className="shrink-0 w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
      <Icon className="w-5 h-5" />
    </span>
    <div className="min-w-0">
      <h3 className="text-base sm:text-lg font-semibold leading-tight">{title}</h3>
      {hint && <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  </div>
);

const SECTION_CARD = 'rounded-2xl bg-card border border-border p-4 sm:p-6';
const CHOICE = (on) => cn('rounded-2xl border-2 text-left transition-all', on ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-border bg-card hover:border-primary/40');

const TripPlannerPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useAuth();
  const { updateContext, setTemporaryVisual } = useDynamicBackground();
  const [step, setStep] = useState(1);
  const [datesOpen, setDatesOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const [formData, setFormData] = useState({
    destinations: location.state?.destination ? [location.state.destination] : [''],
    startDate: null,
    endDate: null,
    tripType: '',
    interests: [],
    budgetRange: 'medium',
    travelersCount: 1,
    hasChildren: false,
    childrenAges: [],
    specialRequirements: '',
    includeNearbyCities: false,
    // Business mode
    isBusinessTrip: false,
    meetings: [{ 
      id: '1',
      agenda: '',
      location: '',
      date: '',
      time: '',
      duration: '',
      participants: '',
      notes: ''
    }],
    // Legacy single meeting fields (for backward compatibility)
    meetingAgenda: '',
    meetingLocation: '',
    meetingDate: '',
    meetingTime: '',
    meetingDuration: ''
  });

  // Helper functions for managing multiple destinations
  const addDestination = () => {
    if (formData.destinations.length < 5) {
      setFormData(prev => ({
        ...prev,
        destinations: [...prev.destinations, '']
      }));
    }
  };

  const removeDestination = (index) => {
    if (formData.destinations.length > 1) {
      setFormData(prev => ({
        ...prev,
        destinations: prev.destinations.filter((_, i) => i !== index)
      }));
    }
  };

  const updateDestination = (index, value) => {
    setFormData(prev => ({
      ...prev,
      destinations: prev.destinations.map((dest, i) => i === index ? value : dest)
    }));
  };

  // Auto-load user profile preferences on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!token || profileLoaded) return;
      
      try {
        const response = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const userProfile = response.data?.profile;
        const learnedPrefs = response.data?.learned_preferences;
        
        if (userProfile || learnedPrefs) {
          setFormData(prev => {
            const updates = { ...prev };
            
            // Load travel interests from profile
            if (userProfile?.travel_interests?.length > 0) {
              // Map backend interests to frontend format
              const interestMapping = {
                'nature': 'Nature & Parks',
                'history': 'Cultural Sites',
                'culture': 'Cultural Sites',
                'shopping': 'Shopping',
                'nightlife': 'Nightlife',
                'food': 'Food & Dining',
                'spirituality': 'Local Experiences',
                'workspaces': 'Local Experiences',
                'museums': 'Museums',
                'beach': 'Beach',
                'adventure': 'Adventure Sports',
                'photography': 'Photography'
              };
              
              updates.interests = userProfile.travel_interests
                .map(i => interestMapping[i.toLowerCase()] || i)
                .filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
            }
            
            // Load travel type/style
            if (userProfile?.travel_type) {
              const typeMapping = {
                'leisure': 'solo',
                'adventure': 'adventure',
                'family': 'family',
                'luxury': 'romantic',
                'business': 'business'
              };
              updates.tripType = typeMapping[userProfile.travel_type] || userProfile.travel_type;
            }
            
            // Load budget preference
            if (userProfile?.budget_preferences?.trip_budget_preference) {
              const budgetMapping = {
                'budget': 'budget',
                'mid-range': 'medium',
                'luxury': 'luxury'
              };
              updates.budgetRange = budgetMapping[userProfile.budget_preferences.trip_budget_preference] || 'medium';
            }
            
            // Load business traveler flag
            if (userProfile?.is_business_traveler) {
              updates.isBusinessTrip = true;
              updates.tripType = 'business';
            }
            
            // Load family info
            if (userProfile?.has_children_under_5 || userProfile?.family_members?.length > 0) {
              updates.hasChildren = true;
              const childMembers = userProfile.family_members?.filter(m => m.relationship === 'child' && m.age < 18) || [];
              if (childMembers.length > 0) {
                updates.childrenAges = childMembers.map(c => c.age || 5);
                updates.travelersCount = 1 + childMembers.length;
              }
            }
            
            // Load health considerations as special requirements
            if (userProfile?.health_considerations) {
              updates.specialRequirements = userProfile.health_considerations;
            }
            
            // Load from learned preferences if available
            if (learnedPrefs) {
              // Use traveler archetype to enhance trip type selection
              if (learnedPrefs.traveler_archetype && !updates.tripType) {
                const archetypeMapping = {
                  'explorer': 'adventure',
                  'relaxer': 'solo',
                  'foodie': 'solo',
                  'culture_buff': 'solo',
                  'adventurer': 'adventure'
                };
                updates.tripType = archetypeMapping[learnedPrefs.traveler_archetype] || updates.tripType;
              }
              
              // Use typical group size
              if (learnedPrefs.typical_group_size > 1) {
                updates.travelersCount = learnedPrefs.typical_group_size;
              }
            }
            
            return updates;
          });
          
          setProfileLoaded(true);
          toast.success('Your preferences have been loaded from your profile', {
            duration: 3000,
            icon: '✨'
          });
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
        // Silently fail - user can still fill in manually
      }
    };
    
    loadUserProfile();
  }, [token, profileLoaded]);

  // Update dynamic background when destination or trip type changes
  useEffect(() => {
    updateContext({
      destination: formData.destinations[0] || '',
      tripType: formData.tripType || (formData.isBusinessTrip ? 'business' : null)
    });
  }, [formData.destinations, formData.tripType, formData.isBusinessTrip, updateContext]);

  // Flash visual when trip type is selected
  const handleTripTypeSelect = (type) => {
    setFormData({ ...formData, tripType: type });
    setTemporaryVisual(type, 0); // Permanent until changed
  };

  const tripTypes = [
    { id: 'business', label: 'Business', icon: Briefcase, description: 'Work trips & conferences' },
    { id: 'family', label: 'Family', icon: Users, description: 'Quality time together' },
    { id: 'solo', label: 'Solo', icon: Plane, description: 'Self-discovery journey' },
    { id: 'adventure', label: 'Adventure', icon: Mountain, description: 'Thrill & excitement' },
    { id: 'romantic', label: 'Romantic', icon: Heart, description: 'Love & connection' }
  ];

  const interests = [
    'Cultural Sites', 'Museums', 'Food & Dining', 'Nightlife', 'Shopping',
    'Nature & Parks', 'Beach', 'Adventure Sports', 'Photography', 'Local Experiences',
    'Art & Architecture', 'Wellness & Spa', 'Historical Places', 'Religious Sites'
  ];

  const budgetOptions = [
    { id: 'low', label: 'Budget', range: '$50-100/day' },
    { id: 'medium', label: 'Moderate', range: '$100-250/day' },
    { id: 'high', label: 'Premium', range: '$250-500/day' },
    { id: 'luxury', label: 'Luxury', range: '$500+/day' }
  ];

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const addChildAge = () => {
    setFormData(prev => ({
      ...prev,
      childrenAges: [...prev.childrenAges, 5]
    }));
  };

  const removeChildAge = (index) => {
    setFormData(prev => ({
      ...prev,
      childrenAges: prev.childrenAges.filter((_, i) => i !== index)
    }));
  };

  const updateChildAge = (index, value) => {
    // Robust age validation for mobile compatibility
    let age = value;
    
    // Handle string input (from text input)
    if (typeof value === 'string') {
      // Remove any non-numeric characters except empty string
      const cleaned = value.replace(/[^0-9]/g, '');
      age = cleaned === '' ? 0 : parseInt(cleaned, 10);
    }
    
    // Ensure it's a valid number
    if (isNaN(age) || age === null || age === undefined) {
      age = 0;
    }
    
    // Clamp to valid range (0-17)
    age = Math.max(0, Math.min(17, Math.floor(age)));
    
    setFormData(prev => ({
      ...prev,
      childrenAges: prev.childrenAges.map((a, i) => i === index ? age : a)
    }));
  };

  const handleSubmit = async () => {
    // Filter out empty destinations
    const validDestinations = formData.destinations.filter(d => d && d.trim());
    
    if (validDestinations.length === 0 || !formData.startDate || !formData.endDate || !formData.tripType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare meetings data for business trips
      const meetingsData = formData.isBusinessTrip && formData.meetings?.length > 0 
        ? formData.meetings.filter(m => m.agenda || m.location || m.date)
        : [];
      
      // Use first meeting for backward compatibility
      const primaryMeeting = meetingsData[0] || {};
      
      const response = await axios.post(`${API}/itinerary/generate`, {
        // Support both single destination (backward compatible) and multiple
        destination: validDestinations[0],
        destinations: validDestinations,
        start_date: format(formData.startDate, 'yyyy-MM-dd'),
        end_date: format(formData.endDate, 'yyyy-MM-dd'),
        trip_type: formData.tripType,
        interests: formData.interests,
        budget_range: formData.budgetRange,
        travelers_count: formData.travelersCount,
        has_children: formData.hasChildren,
        children_ages: formData.childrenAges,
        special_requirements: formData.specialRequirements,
        include_nearby_cities: formData.includeNearbyCities,
        is_business_trip: formData.isBusinessTrip,
        // Multiple meetings support
        meetings: meetingsData,
        // Legacy single meeting fields (backward compatibility)
        meeting_agenda: primaryMeeting.agenda || formData.meetingAgenda,
        meeting_location: primaryMeeting.location || formData.meetingLocation,
        meeting_date: primaryMeeting.date || formData.meetingDate,
        meeting_time: primaryMeeting.time || formData.meetingTime,
        meeting_duration: primaryMeeting.duration || formData.meetingDuration
      }, { 
        withCredentials: true,
        timeout: 180000, // 3 minute timeout for itinerary generation
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      // Log the full response for debugging
      console.log('Itinerary generation response:', response.status, response.data);

      // Check if we got a valid response with an ID
      if (response.status >= 200 && response.status < 300) {
        // Success response - check for ID in various locations
        const responseId = response.data?.id || response.data?.itinerary?.id;
        
        if (responseId) {
          toast.success('Your itinerary is ready!');
          // Small delay to ensure toast is shown before navigation
          setTimeout(() => {
            navigate(`/itinerary/${responseId}`);
          }, 100);
        } else if (response.data) {
          // Response is truthy but no ID found - still consider it success
          console.log('Response without ID:', response.data);
          toast.success('Itinerary created! Redirecting...');
          setTimeout(() => navigate('/my-trips'), 1000);
        } else {
          console.error('Empty response data:', response.data);
          toast.info('Itinerary may have been created. Redirecting to My Trips...');
          setTimeout(() => navigate('/my-trips'), 1500);
        }
      } else {
        console.error('Unexpected response status:', response.status);
        toast.info('Processing complete. Checking your trips...');
        setTimeout(() => navigate('/my-trips'), 1500);
      }
    } catch (error) {
      console.error('Itinerary generation error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const data = error.response?.data;
      if (data?.id) {
        toast.success('Your itinerary is ready!');
        navigate(`/itinerary/${data.id}`);
      } else if (error.code === 'ECONNABORTED' || !error.response) {
        // The request may still have finished on the server, so tell the traveller exactly that.
        toast.error('This is taking longer than expected. Check My Trips in a minute to see if your itinerary was created.', { duration: 8000 });
      } else {
        toast.error(data?.detail || data?.message || 'We could not generate your itinerary. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: 
        const validDests = formData.destinations.filter(d => d && d.trim());
        return validDests.length > 0 && formData.startDate && formData.endDate;
      case 2: return formData.tripType;
      case 3: return true;
      default: return false;
    }
  };

  // Auto-enable business mode when business trip type selected
  React.useEffect(() => {
    if (formData.tripType === 'business') {
      setFormData(prev => ({ ...prev, isBusinessTrip: true }));
    }
  }, [formData.tripType]);

  const validDests = formData.destinations.filter((d) => d && d.trim());
  const nights = formData.startDate && formData.endDate ? Math.round((formData.endDate - formData.startDate) / 86400000) : 0;
  const setField = (patch) => setFormData((prev) => ({ ...prev, ...patch }));
  const updateMeeting = (idx, patch) => setFormData((prev) => ({ ...prev, meetings: prev.meetings.map((m, i) => (i === idx ? { ...m, ...patch } : m)) }));
  const budgetLabel = budgetOptions.find((b) => b.id === formData.budgetRange)?.label;
  const tripLabel = tripTypes.find((t) => t.id === formData.tripType)?.label;

  const StepBody = () => (
    <>
      {step === 1 && (
        <div className="space-y-5 fade-in">
          <div className={SECTION_CARD}>
            <SectionTitle icon={MapPin} title="Where do you want to go?" hint="Add up to 5 cities for a multi-city trip" />
            <div className="space-y-3">
              {formData.destinations.map((dest, index) => (
                <div key={index} className="flex items-center gap-2">
                  {formData.destinations.length > 1 && (
                    <span className="w-7 h-7 shrink-0 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{index + 1}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <DestinationAutocomplete
                      value={dest}
                      onChange={(value) => updateDestination(index, value)}
                      placeholder={index === 0 ? 'Paris, Tokyo, Bali…' : 'Add another city…'}
                      data-testid={`input-destination-${index}`}
                    />
                  </div>
                  {formData.destinations.length > 1 && (
                    <button type="button" onClick={() => removeDestination(index)} aria-label={`Remove destination ${index + 1}`} className="w-10 h-10 shrink-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center" data-testid={`remove-destination-${index}`}>
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              {formData.destinations.length < 5 && (
                <button type="button" onClick={addDestination} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline" data-testid="btn-add-destination">
                  <Plus className="w-4 h-4" /> Add another city
                </button>
              )}
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer ml-auto">
                <Checkbox className="!min-h-0 !min-w-0" id="includeNearbyCities" checked={formData.includeNearbyCities || false} onCheckedChange={(checked) => setField({ includeNearbyCities: checked })} />
                Include nearby cities
              </label>
            </div>
          </div>

          <div className={SECTION_CARD}>
            <SectionTitle icon={CalendarIcon} title="Travel dates" hint="Choose your start and end date." />
            <Popover open={datesOpen} onOpenChange={setDatesOpen}>
              <PopoverTrigger asChild>
                <button type="button" data-testid="date-trigger" aria-label="Choose travel dates"
                  className={cn('w-full grid grid-cols-2 rounded-2xl border-2 text-left transition-colors hover:border-primary/60 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20', datesOpen ? 'border-primary' : 'border-border')}>
                  {[['Start', formData.startDate], ['End', formData.endDate]].map(([label, d], i) => (
                    <span key={label} className={cn('flex items-center gap-3 px-4 py-3.5', i === 0 && 'border-r border-border')}>
                      <CalendarIcon className="w-5 h-5 text-primary shrink-0" />
                      <span className="min-w-0">
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
                        <span className={cn('block text-sm sm:text-base font-semibold truncate', !d && 'text-muted-foreground font-medium')}>{d ? format(d, 'EEE, MMM d, yyyy') : 'Select date'}</span>
                      </span>
                    </span>
                  ))}
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto max-w-[calc(100vw-1.5rem)] p-2 sm:p-3 rounded-2xl">
                <Calendar
                  mode="range"
                  numberOfMonths={typeof window !== 'undefined' && window.innerWidth >= 768 ? 2 : 1}
                  defaultMonth={formData.startDate || new Date()}
                  selected={{ from: formData.startDate || undefined, to: formData.endDate || undefined }}
                  onSelect={(range) => {
                    setField({ startDate: range?.from || null, endDate: range?.to || null });
                    if (range?.from && range?.to && range.to > range.from) setDatesOpen(false);
                  }}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  data-testid="date-calendar"
                />
                <div className="flex items-center justify-between px-2 pb-1 pt-1">
                  <span className="text-xs text-muted-foreground">{nights > 0 ? `${nights} night${nights === 1 ? '' : 's'}` : 'Pick a start, then an end date'}</span>
                  {(formData.startDate || formData.endDate) && (
                    <button type="button" onClick={() => setField({ startDate: null, endDate: null })} className="text-xs font-semibold text-primary hover:underline">Clear</button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {nights > 0 && <p className="mt-3 text-sm text-muted-foreground">{nights} night{nights === 1 ? '' : 's'} in total.</p>}
          </div>

          <div className={SECTION_CARD}>
            <SectionTitle icon={Users} title="Who's travelling?" hint="Number of travellers including you." />
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => setField({ travelersCount: Math.max(1, formData.travelersCount - 1) })} aria-label="Fewer travellers" className="w-11 h-11 rounded-full border border-border hover:border-primary hover:text-primary flex items-center justify-center"><Minus className="w-4 h-4" /></button>
              <span className="text-2xl font-bold w-10 text-center" aria-live="polite">{formData.travelersCount}</span>
              <button type="button" onClick={() => setField({ travelersCount: formData.travelersCount + 1 })} aria-label="More travellers" className="w-11 h-11 rounded-full border border-border hover:border-primary hover:text-primary flex items-center justify-center"><Plus className="w-4 h-4" /></button>
              <span className="text-sm text-muted-foreground">{formData.travelersCount === 1 ? 'traveller' : 'travellers'}</span>
            </div>
            <label className="mt-5 flex items-center gap-3 cursor-pointer">
              <Checkbox className="!min-h-0 !min-w-0" id="hasChildren" checked={formData.hasChildren} onCheckedChange={(checked) => setField({ hasChildren: checked, childrenAges: checked ? (formData.childrenAges.length ? formData.childrenAges : [5]) : [] })} />
              <span className="text-sm font-medium flex items-center gap-2"><Baby className="w-4 h-4 text-primary" /> Travelling with children</span>
            </label>
            {formData.hasChildren && (
              <div className="mt-4 flex flex-wrap gap-3">
                {formData.childrenAges.map((age, idx) => (
                  <div key={idx} className="flex items-center gap-1 rounded-full border border-border pl-3 pr-1 py-1">
                    <span className="text-xs text-muted-foreground mr-1">Child {idx + 1}</span>
                    <button type="button" onClick={() => updateChildAge(idx, Math.max(0, age - 1))} aria-label="Decrease age" className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                    <span className="w-14 text-center text-sm font-semibold">{age} yrs</span>
                    <button type="button" onClick={() => updateChildAge(idx, Math.min(17, age + 1))} aria-label="Increase age" className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                    <button type="button" onClick={() => removeChildAge(idx)} aria-label="Remove child" className="w-7 h-7 rounded-full hover:bg-destructive/10 hover:text-destructive flex items-center justify-center"><X className="w-3 h-3" /></button>
                  </div>
                ))}
                {formData.childrenAges.length < 6 && (
                  <button type="button" onClick={addChildAge} className="inline-flex items-center gap-1 rounded-full border border-dashed border-primary/50 text-primary text-xs font-semibold px-3 py-1.5 hover:bg-primary/5"><Plus className="w-3 h-3" /> Add child</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5 fade-in">
          {profileLoaded && (
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Preferences loaded from your profile</p>
                <p className="text-xs text-muted-foreground">Your style, interests and budget are pre-filled. Adjust anything you like.</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs shrink-0" onClick={() => navigate('/profile')}>Edit profile</Button>
            </div>
          )}
          <div className={SECTION_CARD}>
            <SectionTitle icon={Compass} title="What kind of trip is this?" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {tripTypes.map((type) => (
                <button key={type.id} type="button" onClick={() => handleTripTypeSelect(type.id)} className={cn(CHOICE(formData.tripType === type.id), 'p-4')} data-testid={`trip-type-${type.id}`} aria-pressed={formData.tripType === type.id}>
                  <type.icon className={cn('w-6 h-6 mb-2', formData.tripType === type.id ? 'text-primary' : 'text-muted-foreground')} />
                  <p className="font-semibold text-sm">{type.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
                </button>
              ))}
            </div>
          </div>
          <div className={SECTION_CARD}>
            <SectionTitle icon={Heart} title="What interests you?" hint="Select all that apply." />
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => {
                const on = formData.interests.includes(interest);
                return (
                  <button key={interest} type="button" onClick={() => handleInterestToggle(interest)} aria-pressed={on} data-testid={`interest-${interest.toLowerCase().replace(/\s+/g, '-')}`}
                    className={cn('px-3.5 py-2 rounded-full text-sm font-medium transition-all inline-flex items-center gap-1.5', on ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25' : 'bg-muted/60 hover:bg-muted')}>
                    {on && <Check className="w-3.5 h-3.5" />}{interest}
                  </button>
                );
              })}
            </div>
          </div>
          <div className={SECTION_CARD}>
            <SectionTitle icon={Wallet} title="Budget" hint="A rough guide to help us pick the right places." />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {budgetOptions.map((option) => (
                <button key={option.id} type="button" onClick={() => setField({ budgetRange: option.id })} className={cn(CHOICE(formData.budgetRange === option.id), 'p-3.5 text-center')} data-testid={`budget-${option.id}`} aria-pressed={formData.budgetRange === option.id}>
                  <p className="font-semibold text-sm">{option.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{option.range}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5 fade-in">
          <div className={cn(SECTION_CARD, 'flex items-center justify-between gap-4')}>
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Briefcase className="w-5 h-5" /></span>
              <div>
                <p className="font-semibold text-sm sm:text-base">Business trip mode</p>
                <p className="text-xs text-muted-foreground">Plan around your meetings</p>
              </div>
            </div>
            <Switch checked={formData.isBusinessTrip} onCheckedChange={(checked) => setField({ isBusinessTrip: checked })} data-testid="switch-business" />
          </div>

          {formData.isBusinessTrip && (
            <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold flex items-center gap-2"><Building className="w-5 h-5 text-primary" /> Meetings</h3>
                {formData.meetings.length < 5 && (
                  <Button type="button" variant="outline" size="sm" className="bg-card text-xs" data-testid="btn-add-meeting"
                    onClick={() => setFormData((prev) => ({ ...prev, meetings: [...prev.meetings, { id: String(Date.now()), agenda: '', location: '', date: '', time: '', duration: '', participants: '', notes: '' }] }))}>
                    <Plus className="w-3 h-3 mr-1" /> Add meeting
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">We'll leave buffer time around each meeting and suggest things to do afterwards. Up to 5 meetings.</p>
              {formData.meetings.map((m, idx) => (
                <div key={m.id} className="rounded-xl bg-card border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">Meeting {idx + 1}</p>
                    {formData.meetings.length > 1 && (
                      <button type="button" aria-label={`Remove meeting ${idx + 1}`} onClick={() => setFormData((prev) => ({ ...prev, meetings: prev.meetings.filter((_, i) => i !== idx) }))} className="w-8 h-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Agenda</Label><Input value={m.agenda} onChange={(e) => updateMeeting(idx, { agenda: e.target.value })} placeholder="e.g. Quarterly review" /></div>
                    <div className="space-y-1"><Label className="text-xs">Location</Label><Input value={m.location} onChange={(e) => updateMeeting(idx, { location: e.target.value })} placeholder="e.g. Conference room A" /></div>
                    <div className="space-y-1"><Label className="text-xs">Date</Label><Input type="date" value={m.date} onChange={(e) => updateMeeting(idx, { date: e.target.value })} /></div>
                    <div className="space-y-1"><Label className="text-xs">Time</Label><Input type="time" value={m.time} onChange={(e) => updateMeeting(idx, { time: e.target.value })} /></div>
                    <div className="space-y-1">
                      <Label className="text-xs">Duration</Label>
                      <Select value={m.duration} onValueChange={(v) => updateMeeting(idx, { duration: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30min">30 min</SelectItem><SelectItem value="1hr">1 hour</SelectItem><SelectItem value="2hr">2 hours</SelectItem>
                          <SelectItem value="halfday">Half day</SelectItem><SelectItem value="fullday">Full day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label className="text-xs">Participants</Label><Input value={m.participants} onChange={(e) => updateMeeting(idx, { participants: e.target.value })} placeholder="e.g. Client team" /></div>
                    <div className="space-y-1 sm:col-span-2"><Label className="text-xs">Notes</Label><Input value={m.notes} onChange={(e) => updateMeeting(idx, { notes: e.target.value })} placeholder="Anything we should know" /></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={SECTION_CARD}>
            <SectionTitle icon={FileText} title="Anything else we should know?" hint="Dietary needs, accessibility, must-see places…" />
            <Textarea value={formData.specialRequirements} onChange={(e) => setField({ specialRequirements: e.target.value })} placeholder="Optional" rows={4} />
          </div>
        </div>
      )}
    </>
  );

  const Summary = () => (
    <aside className="rounded-3xl border border-border bg-card overflow-hidden" aria-label="Trip summary">
      <div className="relative surface-ink p-5 overflow-hidden">
        <div className="mesh-bg" aria-hidden="true"><i /></div>
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">Your trip</p>
          <p className="mt-1 text-xl font-extrabold text-white leading-tight">{validDests.length ? validDests.join(' → ') : 'Choose a destination'}</p>
          {nights > 0 && <p className="mt-1 text-sm text-white/70">{nights} night{nights === 1 ? '' : 's'}</p>}
        </div>
      </div>
      <dl className="p-5 space-y-3.5 text-sm">
        {[
          ['Dates', formData.startDate && formData.endDate ? `${format(formData.startDate, 'MMM d')} – ${format(formData.endDate, 'MMM d, yyyy')}` : '—'],
          ['Travellers', `${formData.travelersCount}${formData.hasChildren ? ` (${formData.childrenAges.length} child${formData.childrenAges.length === 1 ? '' : 'ren'})` : ''}`],
          ['Trip type', tripLabel || '—'],
          ['Budget', budgetLabel || '—'],
          ['Interests', formData.interests.length ? `${formData.interests.length} selected` : '—'],
          ['Mode', formData.isBusinessTrip ? 'Business' : 'Leisure'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4"><dt className="text-muted-foreground">{k}</dt><dd className="font-semibold text-right">{v}</dd></div>
        ))}
      </dl>
    </aside>
  );

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col overflow-x-hidden" data-testid="trip-planner-page">
      <Navbar />
      <PageHero image={IMG.santorini(1920)} eyebrow="AI trip planner" title="Plan your perfect trip" subtitle="Tell us what you love and we'll build a day-by-day itinerary." />

      <main className="flex-1 pb-28 lg:pb-14">
        <div className="container-main pt-8">
          <div className="mb-5"><CampaignBanner placement="DESTINATION_PAGE" /></div>

          <ol className="mb-6 grid gap-2 sm:gap-3 max-w-3xl" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }} aria-label="Planner progress">
            {PLANNER_STEPS.map((st) => {
              const done = st.n < step;
              const active = st.n === step;
              return (
                <li key={st.n} className="min-w-0">
                  <button type="button" disabled={st.n > step && !canProceed()} onClick={() => st.n <= step && setStep(st.n)} aria-current={active ? 'step' : undefined}
                    className={cn('w-full min-w-0 rounded-2xl border px-2.5 sm:px-3 py-3 flex items-center gap-2 sm:gap-2.5 text-left transition-all bg-card', active ? 'border-primary shadow-lg shadow-primary/10' : done ? 'border-primary/30' : 'border-border')}>
                    <span className={cn('w-7 h-7 shrink-0 rounded-full text-xs font-bold flex items-center justify-center', done ? 'bg-primary text-primary-foreground' : active ? 'brand-gradient text-white' : 'bg-muted text-muted-foreground')}>{done ? <Check className="w-4 h-4" /> : st.n}</span>
                    <span className={cn('text-[11px] sm:text-sm font-semibold leading-tight truncate', !active && !done && 'text-muted-foreground')}>{st.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
            <div className="relative">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-1">
                {step === 1 && 'Where & when are you travelling?'}
                {step === 2 && 'How do you like to travel?'}
                {step === 3 && (formData.isBusinessTrip ? 'Your meetings' : 'Any final details?')}
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                {step === 1 && 'Pick your destination, dates and who is coming along.'}
                {step === 2 && 'Help us tailor the plan to your style.'}
                {step === 3 && 'Almost there. Review and generate your itinerary.'}
              </p>

              {StepBody()}

              {isLoading && (
                <div className="absolute inset-0 z-20 rounded-3xl bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8" role="status" aria-live="polite">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                  <p className="text-lg font-bold">Creating your itinerary…</p>
                  <p className="text-sm text-muted-foreground max-w-xs mt-1">This can take a minute or two. Please keep this page open.</p>
                </div>
              )}

              <div className="fixed lg:static bottom-0 inset-x-0 z-30 lg:z-auto bg-background/95 lg:bg-transparent backdrop-blur border-t lg:border-0 border-border px-4 py-3 lg:px-0 lg:py-0 lg:mt-8 flex items-center justify-between gap-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
                {step > 1 ? (
                  <Button variant="outline" onClick={() => setStep(step - 1)} className="rounded-full gap-2 px-6" data-testid="btn-back"><ArrowLeft className="w-4 h-4" /> Back</Button>
                ) : <span />}
                {step < 3 ? (
                  <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="rounded-full gap-2 px-8 brand-gradient text-white" data-testid="btn-next">Continue <ChevronRight className="w-4 h-4" /></Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isLoading} className="rounded-full gap-2 px-8 brand-gradient text-white" data-testid="btn-generate">
                    {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><Sparkles className="w-4 h-4" /> Generate itinerary</>}
                  </Button>
                )}
              </div>
            </div>

            <div className="hidden lg:block sticky top-28"><Summary /></div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TripPlannerPage;
