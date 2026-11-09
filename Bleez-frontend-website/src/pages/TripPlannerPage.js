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
  Clock, FileText, Building, X
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

const SECTION_CARD = 'rounded-2xl bg-card border border-border shadow-sm p-4 sm:p-6';

const TripPlannerPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useAuth();
  const { updateContext, setTemporaryVisual } = useDynamicBackground();
  const [step, setStep] = useState(1);
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
      
      // Check if the error response actually contains a successful result
      if (error.response?.status >= 200 && error.response?.status < 300) {
        // This was actually a success!
        const responseId = error.response?.data?.id;
        if (responseId) {
          toast.success('Your itinerary is ready!');
          navigate(`/itinerary/${responseId}`);
          return;
        }
      }
      
      // Check if the itinerary was actually created despite the error
      if (error.response?.data?.id) {
        toast.success('Your itinerary is ready!');
        navigate(`/itinerary/${error.response.data.id}`);
      } else if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
        // Timeout or network error - itinerary might still be generating/saved
        toast.info('Request completed. Checking your trips...', {
          duration: 3000
        });
        setTimeout(() => navigate('/my-trips'), 2000);
      } else if (error.response?.status >= 500) {
        // Server error but itinerary might have been saved
        toast.info('Processing complete. Checking your trips...');
        setTimeout(() => navigate('/my-trips'), 2000);
      } else if (!error.response) {
        // Network error without response - could be timeout
        toast.info('Processing may be complete. Checking your trips...');
        setTimeout(() => navigate('/my-trips'), 2000);
      } else {
        // Actual failure with error message
        const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.message ||
                           'Failed to generate itinerary. Please try again.';
        toast.error(errorMessage);
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

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col overflow-x-hidden" data-testid="trip-planner-page">
      <Navbar />
      <PageHero image={IMG.santorini(1600)} eyebrow="AI trip planner" title="Plan your perfect trip" subtitle="Tell us what you love. We'll build the itinerary." />
      
      <main className="flex-1 pb-8 sm:pb-12">
        <div className="container-main my-4"><CampaignBanner placement="DESTINATION_PAGE" /></div>

        <div className="container-main">
          {/* Stepper */}
          <ol className="max-w-xl mx-auto mb-8 sm:mb-10 flex items-center" aria-label="Planner progress">
            {PLANNER_STEPS.map((st, idx) => {
              const done = st.n < step;
              const active = st.n === step;
              return (
                <li key={st.n} className={cn('flex items-center', idx < PLANNER_STEPS.length - 1 && 'flex-1')}>
                  <div className="flex flex-col items-center gap-1.5 w-20 sm:w-28">
                    <span
                      className={cn(
                        'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all',
                        done && 'bg-primary border-primary text-primary-foreground',
                        active && 'border-primary text-primary bg-primary/10 ring-4 ring-primary/15',
                        !done && !active && 'border-border text-muted-foreground bg-card'
                      )}
                      aria-current={active ? 'step' : undefined}
                    >
                      {done ? '✓' : st.n}
                    </span>
                    <span className={cn('text-[11px] sm:text-xs text-center font-medium', active ? 'text-foreground' : 'text-muted-foreground')}>
                      {st.label}
                    </span>
                  </div>
                  {idx < PLANNER_STEPS.length - 1 && (
                    <span className={cn('flex-1 h-0.5 -mt-5 rounded-full transition-colors', done ? 'bg-primary' : 'bg-border')} />
                  )}
                </li>
              );
            })}
          </ol>

          {/* Step heading */}
          <div className="max-w-2xl mx-auto text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              {step === 1 && 'Where & when are you travelling?'}
              {step === 2 && 'How do you like to travel?'}
              {step === 3 && (formData.isBusinessTrip ? 'Business meeting details' : 'Any final details?')}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              {step === 1 && 'Pick your destination, dates and who is coming along.'}
              {step === 2 && 'Help us understand your style so we can tailor the plan.'}
              {step === 3 && (formData.isBusinessTrip ? 'Add your meetings so we can plan around them.' : 'Special requests or preferences? Add them here.')}
            </p>
          </div>

          {/* Step Content */}
          <div className="max-w-2xl mx-auto px-0 sm:px-4">
            {step === 1 && (
              <div className="space-y-6 sm:space-y-8 fade-in">
                {/* Multiple Destinations */}
                <div className={cn(SECTION_CARD, 'space-y-2 sm:space-y-3')}>
                  <div className="flex items-center justify-between">
                    <SectionTitle n={1} icon={MapPin} title="Where do you want to go?" hint="Add up to 5 cities for a multi-city trip" />
                    {formData.destinations.length > 1 && (
                      <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                        Multi-city trip
                      </span>
                    )}
                  </div>
                  
                  {/* Destination Inputs */}
                  <div className="space-y-3">
                    {formData.destinations.map((dest, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1 relative">
                          {formData.destinations.length > 1 && (
                            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                              {index + 1}
                            </div>
                          )}
                          <DestinationAutocomplete
                            value={dest}
                            onChange={(value) => updateDestination(index, value)}
                            placeholder={index === 0 ? "Paris, Tokyo, Bali..." : "Add another city..."}
                            data-testid={`input-destination-${index}`}
                          />
                        </div>
                        {formData.destinations.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDestination(index)}
                            className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            data-testid={`remove-destination-${index}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Destination Button */}
                  {formData.destinations.length < 5 && formData.destinations[0] && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addDestination}
                      className="w-full mt-2 border-dashed border-primary/30 text-primary hover:bg-primary/5 hover:border-primary"
                      data-testid="add-destination-btn"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add another city
                      <span className="ml-2 text-xs text-muted-foreground">({formData.destinations.length}/5)</span>
                    </Button>
                  )}
                  
                  {/* Include Nearby Cities Option */}
                  {formData.destinations.some(d => d && d.trim()) && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border mt-3">
                      <Checkbox
                        id="includeNearbyCities"
                        checked={formData.includeNearbyCities || false}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          includeNearbyCities: checked 
                        }))}
                        className="h-4 w-4"
                        data-testid="checkbox-nearby-cities"
                      />
                      <div className="flex-1">
                        <Label htmlFor="includeNearbyCities" className="text-sm cursor-pointer flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          Include nearby cities & day trips
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Expand your trip with attractions within 100km radius
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Date Range - Single Calendar with Auto Selection */}
                <div className={cn(SECTION_CARD, 'space-y-3')}>
                  <SectionTitle n={2} icon={CalendarIcon} title="Travel dates" hint="Tap your start date, then your end date." />
                  
                  {/* Date Display */}
                  <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                    <div 
                      className={cn(
                        "p-3 sm:p-4 rounded-xl border transition-all",
                        formData.startDate 
                          ? "bg-primary/10 border-primary/30" 
                          : "bg-card border-border border-dashed"
                      )}
                    >
                      <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                      <p className={cn(
                        "text-sm sm:text-base font-medium",
                        !formData.startDate && "text-muted-foreground"
                      )}>
                        {formData.startDate ? format(formData.startDate, 'MMM d, yyyy') : 'Select date'}
                      </p>
                    </div>
                    <div 
                      className={cn(
                        "p-3 sm:p-4 rounded-xl border transition-all",
                        formData.endDate 
                          ? "bg-primary/10 border-primary/30" 
                          : "bg-card border-border border-dashed"
                      )}
                    >
                      <p className="text-xs text-muted-foreground mb-1">End Date</p>
                      <p className={cn(
                        "text-sm sm:text-base font-medium",
                        !formData.endDate && "text-muted-foreground"
                      )}>
                        {formData.endDate ? format(formData.endDate, 'MMM d, yyyy') : 'Select date'}
                      </p>
                    </div>
                  </div>

                  {/* Single Calendar */}
                  <div className="rounded-xl bg-muted/40 border border-border p-3 sm:p-4 flex flex-col items-center">
                    <Calendar
                      mode="single"
                      selected={formData.endDate || formData.startDate}
                      onSelect={(date) => {
                        if (!date) return;
                        
                        if (!formData.startDate) {
                          // No start date - set it
                          setFormData(prev => ({ ...prev, startDate: date, endDate: null }));
                        } else if (!formData.endDate) {
                          // Has start, no end
                          if (date < formData.startDate) {
                            // Selected date is before start - make it new start
                            setFormData(prev => ({ ...prev, startDate: date }));
                          } else {
                            // Selected date is after start - set as end
                            setFormData(prev => ({ ...prev, endDate: date }));
                          }
                        } else {
                          // Both dates set - start fresh with new start date
                          setFormData(prev => ({ ...prev, startDate: date, endDate: null }));
                        }
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      modifiers={{
                        start: formData.startDate,
                        end: formData.endDate,
                        range: formData.startDate && formData.endDate 
                          ? { from: formData.startDate, to: formData.endDate }
                          : undefined
                      }}
                      modifiersStyles={{
                        start: { 
                          backgroundColor: 'hsl(43 74% 52%)', 
                          color: 'hsl(222 47% 2%)',
                          borderRadius: '9999px'
                        },
                        end: { 
                          backgroundColor: 'hsl(43 74% 52%)', 
                          color: 'hsl(222 47% 2%)',
                          borderRadius: '9999px'
                        },
                        range: {
                          backgroundColor: 'rgba(142, 79, 208, 0.15)'
                        }
                      }}
                      className="mx-auto"
                      data-testid="date-calendar"
                    />
                    
                    {/* Trip Duration */}
                    {formData.startDate && formData.endDate && (
                      <div className="mt-3 pt-3 border-t border-border text-center">
                        <p className="text-sm text-primary font-medium">
                          {Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24))} days trip
                        </p>
                      </div>
                    )}
                    
                    {/* Clear Dates Button */}
                    {(formData.startDate || formData.endDate) && (
                      <div className="mt-3 text-center">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, startDate: null, endDate: null }))}
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                          Clear dates
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Travelers */}
                <div className={cn(SECTION_CARD, 'space-y-3')}>
                  <SectionTitle n={3} icon={Users} title="Who's travelling?" hint="Number of travellers including you." />
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-xl bg-card border-border"
                      onClick={() => setFormData(prev => ({ ...prev, travelersCount: Math.max(1, prev.travelersCount - 1) }))}
                      data-testid="btn-travelers-minus"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-2xl font-medium w-12 text-center">{formData.travelersCount}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-xl bg-card border-border"
                      onClick={() => setFormData(prev => ({ ...prev, travelersCount: prev.travelersCount + 1 }))}
                      data-testid="btn-travelers-plus"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <span className="text-muted-foreground ml-4">
                      <Users className="inline w-4 h-4 mr-2" />
                      {formData.travelersCount} {formData.travelersCount === 1 ? 'traveler' : 'travelers'}
                    </span>
                  </div>
                </div>

                {/* Traveling with Children - PRIMARY FILTER */}
                <div className="p-4 rounded-2xl bg-card border border-border">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="hasChildren-step1"
                          checked={formData.hasChildren}
                          onCheckedChange={(checked) => setFormData(prev => ({ 
                            ...prev, 
                            hasChildren: checked,
                            childrenAges: checked ? (prev.childrenAges.length > 0 ? prev.childrenAges : [5]) : []
                          }))}
                          className="h-5 w-5"
                          data-testid="checkbox-children-primary"
                        />
                        <Label htmlFor="hasChildren-step1" className="text-base font-medium cursor-pointer flex items-center gap-2">
                          <Heart className="w-4 h-4 text-pink-400" />
                          Traveling with children?
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 ml-8">
                        Get family-friendly recommendations and activities
                      </p>
                    </div>
                  </div>

                  {/* Children Ages - Inline when checked */}
                  {formData.hasChildren && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-muted-foreground">Ages:</span>
                        {formData.childrenAges.map((age, idx) => (
                          <div key={idx} className="flex items-center gap-1 bg-muted rounded-lg px-2 py-1">
                            <button
                              type="button"
                              onClick={() => updateChildAge(idx, Math.max(0, age - 1))}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-medium">{age}</span>
                            <button
                              type="button"
                              onClick={() => updateChildAge(idx, Math.min(17, age + 1))}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeChildAge(idx)}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-destructive/20 text-destructive transition-colors ml-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addChildAge}
                          className="h-8 px-3 bg-card border-border"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Ages 0-17 • Helps us recommend age-appropriate activities
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 fade-in">
                {/* Profile Loaded Indicator */}
                {profileLoaded && (
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Preferences loaded from your profile</p>
                      <p className="text-xs text-muted-foreground">
                        Your travel style, interests, and budget are pre-filled. Feel free to adjust them.
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs shrink-0"
                      onClick={() => navigate('/profile')}
                    >
                      Edit Profile
                    </Button>
                  </div>
                )}
                
                {/* Trip Type */}
                <div className="space-y-4">
                  <Label className="text-lg">What kind of trip is this?</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {tripTypes.map(type => (
                      <button
                        key={type.id}
                        onClick={() => handleTripTypeSelect(type.id)}
                        className={cn(
                          "p-6 rounded-2xl border transition-all duration-300 text-left",
                          formData.tripType === type.id
                            ? "border-primary bg-primary/10 neon-glow"
                            : "border-border bg-card hover:border-border"
                        )}
                        data-testid={`trip-type-${type.id}`}
                      >
                        <type.icon className={cn(
                          "w-8 h-8 mb-3",
                          formData.tripType === type.id ? "text-primary" : "text-muted-foreground"
                        )} />
                        <p className="font-medium">{type.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div className="space-y-4">
                  <Label className="text-lg">What interests you? (Select all that apply)</Label>
                  <div className="flex flex-wrap gap-3">
                    {interests.map(interest => (
                      <button
                        key={interest}
                        onClick={() => handleInterestToggle(interest)}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm transition-all duration-300",
                          formData.interests.includes(interest)
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border hover:bg-muted"
                        )}
                        data-testid={`interest-${interest.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div className="space-y-4">
                  <Label className="text-lg">Budget Range</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {budgetOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => setFormData(prev => ({ ...prev, budgetRange: option.id }))}
                        className={cn(
                          "p-4 rounded-xl border transition-all duration-300 text-center",
                          formData.budgetRange === option.id
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-border"
                        )}
                        data-testid={`budget-${option.id}`}
                      >
                        <p className="font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{option.range}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 fade-in">
                {/* Business Mode Toggle */}
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Briefcase className={cn("w-5 h-5", formData.isBusinessTrip ? "text-primary" : "text-muted-foreground")} />
                      <div>
                        <Label className="text-base cursor-pointer">Business Trip Mode</Label>
                        <p className="text-xs text-muted-foreground">Enable for meeting-aware scheduling</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.isBusinessTrip}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isBusinessTrip: checked }))}
                      data-testid="switch-business"
                    />
                  </div>
                </div>

                {/* Business Trip Details */}
                {formData.isBusinessTrip && (
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-lg flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" />
                        Meeting Details
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          meetings: [...prev.meetings, {
                            id: String(Date.now()),
                            agenda: '',
                            location: '',
                            date: '',
                            time: '',
                            duration: '',
                            participants: '',
                            notes: ''
                          }]
                        }))}
                        className="bg-card border-border text-xs"
                        data-testid="btn-add-meeting"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Meeting
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      AI will prioritize punctuality, add buffer time, and suggest post-meeting activities.
                    </p>

                    {/* Multiple Meetings */}
                    <div className="space-y-4">
                      {formData.meetings.map((meeting, idx) => (
                        <div 
                          key={meeting.id} 
                          className={cn(
                            "p-4 rounded-xl border transition-all",
                            idx === 0 ? "bg-card border-primary/30" : "bg-white/3 border-border"
                          )}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary">
                                {idx + 1}
                              </span>
                              Meeting {idx + 1}
                              {idx === 0 && <span className="text-xs text-muted-foreground">(Primary)</span>}
                            </span>
                            {formData.meetings.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  meetings: prev.meetings.filter((_, i) => i !== idx)
                                }))}
                                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div className="grid md:grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <Label className="text-xs flex items-center gap-1.5">
                                  <FileText className="w-3 h-3" />
                                  Agenda
                                </Label>
                                <Input
                                  value={meeting.agenda}
                                  onChange={(e) => {
                                    const newMeetings = [...formData.meetings];
                                    newMeetings[idx].agenda = e.target.value;
                                    setFormData(prev => ({ ...prev, meetings: newMeetings }));
                                  }}
                                  placeholder="e.g., Quarterly review..."
                                  className="bg-card border-border rounded-lg h-9 text-sm"
                                  data-testid={`input-meeting-${idx}-agenda`}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs flex items-center gap-1.5">
                                  <Building className="w-3 h-3" />
                                  Location
                                </Label>
                                <Input
                                  value={meeting.location}
                                  onChange={(e) => {
                                    const newMeetings = [...formData.meetings];
                                    newMeetings[idx].location = e.target.value;
                                    setFormData(prev => ({ ...prev, meetings: newMeetings }));
                                  }}
                                  placeholder="e.g., Conference Room A..."
                                  className="bg-card border-border rounded-lg h-9 text-sm"
                                  data-testid={`input-meeting-${idx}-location`}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div className="space-y-1.5">
                                <Label className="text-xs flex items-center gap-1.5">
                                  <CalendarIcon className="w-3 h-3" />
                                  Date
                                </Label>
                                <Input
                                  type="date"
                                  value={meeting.date}
                                  onChange={(e) => {
                                    const newMeetings = [...formData.meetings];
                                    newMeetings[idx].date = e.target.value;
                                    setFormData(prev => ({ ...prev, meetings: newMeetings }));
                                  }}
                                  className="bg-card border-border rounded-lg h-9 text-sm"
                                  data-testid={`input-meeting-${idx}-date`}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs flex items-center gap-1.5">
                                  <Clock className="w-3 h-3" />
                                  Time
                                </Label>
                                <Input
                                  type="time"
                                  value={meeting.time}
                                  onChange={(e) => {
                                    const newMeetings = [...formData.meetings];
                                    newMeetings[idx].time = e.target.value;
                                    setFormData(prev => ({ ...prev, meetings: newMeetings }));
                                  }}
                                  className="bg-card border-border rounded-lg h-9 text-sm"
                                  data-testid={`input-meeting-${idx}-time`}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs">Duration</Label>
                                <Select
                                  value={meeting.duration}
                                  onValueChange={(val) => {
                                    const newMeetings = [...formData.meetings];
                                    newMeetings[idx].duration = val;
                                    setFormData(prev => ({ ...prev, meetings: newMeetings }));
                                  }}
                                >
                                  <SelectTrigger className="bg-card border-border rounded-lg h-9 text-sm" data-testid={`select-meeting-${idx}-duration`}>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent className="glass border-border">
                                    <SelectItem value="30min">30 min</SelectItem>
                                    <SelectItem value="1hr">1 hour</SelectItem>
                                    <SelectItem value="2hr">2 hours</SelectItem>
                                    <SelectItem value="halfday">Half day</SelectItem>
                                    <SelectItem value="fullday">Full day</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Additional meeting details (collapsed by default for secondary meetings) */}
                            {idx === 0 && (
                              <div className="grid md:grid-cols-2 gap-3 pt-2">
                                <div className="space-y-1.5">
                                  <Label className="text-xs flex items-center gap-1.5">
                                    <Users className="w-3 h-3" />
                                    Participants
                                  </Label>
                                  <Input
                                    value={meeting.participants}
                                    onChange={(e) => {
                                      const newMeetings = [...formData.meetings];
                                      newMeetings[idx].participants = e.target.value;
                                      setFormData(prev => ({ ...prev, meetings: newMeetings }));
                                    }}
                                    placeholder="e.g., John, Client Team..."
                                    className="bg-card border-border rounded-lg h-9 text-sm"
                                    data-testid={`input-meeting-${idx}-participants`}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs">Notes</Label>
                                  <Input
                                    value={meeting.notes}
                                    onChange={(e) => {
                                      const newMeetings = [...formData.meetings];
                                      newMeetings[idx].notes = e.target.value;
                                      setFormData(prev => ({ ...prev, meetings: newMeetings }));
                                    }}
                                    placeholder="Any special notes..."
                                    className="bg-card border-border rounded-lg h-9 text-sm"
                                    data-testid={`input-meeting-${idx}-notes`}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {formData.meetings.length < 5 && (
                      <p className="text-xs text-muted-foreground text-center">
                        You can add up to 5 meetings per trip
                      </p>
                    )}
                  </div>
                )}

                {/* Children */}
                {!formData.isBusinessTrip && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="hasChildren"
                        checked={formData.hasChildren}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          hasChildren: checked,
                          childrenAges: checked ? prev.childrenAges : []
                        }))}
                        data-testid="checkbox-children"
                      />
                      <Label htmlFor="hasChildren" className="text-lg cursor-pointer">
                        Traveling with children?
                      </Label>
                    </div>

                    {formData.hasChildren && (
                      <div className="pl-4 sm:pl-8 space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Add children's ages for personalized recommendations
                        </p>
                        {formData.childrenAges.map((age, idx) => (
                          <div key={idx} className="flex items-center gap-2 sm:gap-4">
                            <span className="text-sm text-muted-foreground w-16 sm:w-20 shrink-0">Child {idx + 1}</span>
                            
                            {/* Mobile-friendly age selector with stepper buttons */}
                            <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
                              <button
                                type="button"
                                onClick={() => updateChildAge(idx, Math.max(0, age - 1))}
                                className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-muted hover:bg-muted active:bg-white/30 transition-colors touch-manipulation"
                                disabled={age <= 0}
                                aria-label="Decrease age"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={age}
                                onChange={(e) => updateChildAge(idx, e.target.value)}
                                onBlur={(e) => {
                                  // Auto-correct on blur
                                  const val = parseInt(e.target.value, 10);
                                  if (isNaN(val) || val < 0) updateChildAge(idx, 0);
                                  else if (val > 17) updateChildAge(idx, 17);
                                }}
                                className="w-12 h-10 sm:h-8 text-center bg-transparent border-none focus:outline-none focus:ring-0 text-lg font-medium"
                                aria-label={`Child ${idx + 1} age`}
                              />
                              
                              <button
                                type="button"
                                onClick={() => updateChildAge(idx, Math.min(17, age + 1))}
                                className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-muted hover:bg-muted active:bg-white/30 transition-colors touch-manipulation"
                                disabled={age >= 17}
                                aria-label="Increase age"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <span className="text-sm text-muted-foreground hidden sm:inline">years old</span>
                            
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeChildAge(idx)}
                              className="text-destructive h-10 w-10 sm:h-8 sm:w-8 shrink-0 touch-manipulation"
                              aria-label={`Remove child ${idx + 1}`}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addChildAge}
                          className="bg-card border-border h-11 sm:h-9 touch-manipulation"
                          data-testid="btn-add-child"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Child
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Ages must be 0-17 years
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Special Requirements */}
                <div className="space-y-3">
                  <Label className="text-lg">Any special requirements?</Label>
                  <Textarea
                    value={formData.specialRequirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialRequirements: e.target.value }))}
                    placeholder="Dietary restrictions, accessibility needs, specific interests..."
                    className="min-h-[100px] bg-card border-border rounded-xl"
                    data-testid="textarea-requirements"
                  />
                </div>

                {/* Summary */}
                <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                  <h3 className="font-medium text-lg">Trip Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">
                        {formData.destinations.filter(d => d && d.trim()).length > 1 ? 'Destinations' : 'Destination'}
                      </p>
                      <div className="font-medium">
                        {formData.destinations.filter(d => d && d.trim()).length > 0 
                          ? formData.destinations.filter(d => d && d.trim()).map((dest, i) => (
                              <span key={i}>
                                {dest}
                                {i < formData.destinations.filter(d => d && d.trim()).length - 1 && (
                                  <span className="text-primary mx-1">→</span>
                                )}
                              </span>
                            ))
                          : '-'
                        }
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Dates</p>
                      <p className="font-medium">
                        {formData.startDate && formData.endDate 
                          ? `${format(formData.startDate, 'MMM d')} - ${format(formData.endDate, 'MMM d, yyyy')}`
                          : '-'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Trip Type</p>
                      <p className="font-medium capitalize">{formData.tripType || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Mode</p>
                      <p className="font-medium">{formData.isBusinessTrip ? 'Business' : 'Leisure'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12">
              {step > 1 ? (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="btn-secondary"
                  data-testid="btn-back"
                >
                  Back
                </Button>
              ) : (
                <div />
              )}
              
              {step < 3 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="btn-primary gap-2"
                  data-testid="btn-next"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="btn-primary gap-2 px-8"
                  data-testid="btn-generate"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating your itinerary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Itinerary
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TripPlannerPage;
