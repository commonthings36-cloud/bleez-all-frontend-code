import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Loader2, X, Search, Globe, Building2, ChevronRight } from 'lucide-react';
import { Input } from './ui/input';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Debounce hook for performance
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Popular cities by country for city-level search
const CITIES_BY_COUNTRY = {
  'France': [
    { name: 'Paris', region: 'Île-de-France' },
    { name: 'Nice', region: 'Provence-Alpes-Côte d\'Azur' },
    { name: 'Lyon', region: 'Auvergne-Rhône-Alpes' },
    { name: 'Marseille', region: 'Provence-Alpes-Côte d\'Azur' },
    { name: 'Bordeaux', region: 'Nouvelle-Aquitaine' },
    { name: 'Strasbourg', region: 'Grand Est' },
  ],
  'Japan': [
    { name: 'Tokyo', region: 'Kantō' },
    { name: 'Kyoto', region: 'Kansai' },
    { name: 'Osaka', region: 'Kansai' },
    { name: 'Hiroshima', region: 'Chūgoku' },
    { name: 'Nara', region: 'Kansai' },
    { name: 'Sapporo', region: 'Hokkaido' },
  ],
  'USA': [
    { name: 'New York', region: 'New York' },
    { name: 'Los Angeles', region: 'California' },
    { name: 'San Francisco', region: 'California' },
    { name: 'Miami', region: 'Florida' },
    { name: 'Las Vegas', region: 'Nevada' },
    { name: 'Chicago', region: 'Illinois' },
    { name: 'Seattle', region: 'Washington' },
    { name: 'Boston', region: 'Massachusetts' },
  ],
  'United Kingdom': [
    { name: 'London', region: 'England' },
    { name: 'Edinburgh', region: 'Scotland' },
    { name: 'Manchester', region: 'England' },
    { name: 'Liverpool', region: 'England' },
    { name: 'Oxford', region: 'England' },
    { name: 'Cambridge', region: 'England' },
  ],
  'Italy': [
    { name: 'Rome', region: 'Lazio' },
    { name: 'Venice', region: 'Veneto' },
    { name: 'Florence', region: 'Tuscany' },
    { name: 'Milan', region: 'Lombardy' },
    { name: 'Naples', region: 'Campania' },
    { name: 'Amalfi', region: 'Campania' },
  ],
  'Spain': [
    { name: 'Barcelona', region: 'Catalonia' },
    { name: 'Madrid', region: 'Community of Madrid' },
    { name: 'Seville', region: 'Andalusia' },
    { name: 'Valencia', region: 'Valencian Community' },
    { name: 'Granada', region: 'Andalusia' },
    { name: 'Ibiza', region: 'Balearic Islands' },
  ],
  'Germany': [
    { name: 'Berlin', region: 'Berlin' },
    { name: 'Munich', region: 'Bavaria' },
    { name: 'Frankfurt', region: 'Hesse' },
    { name: 'Hamburg', region: 'Hamburg' },
    { name: 'Cologne', region: 'North Rhine-Westphalia' },
    { name: 'Dresden', region: 'Saxony' },
  ],
  'Australia': [
    { name: 'Sydney', region: 'New South Wales' },
    { name: 'Melbourne', region: 'Victoria' },
    { name: 'Brisbane', region: 'Queensland' },
    { name: 'Perth', region: 'Western Australia' },
    { name: 'Adelaide', region: 'South Australia' },
    { name: 'Gold Coast', region: 'Queensland' },
  ],
  'Thailand': [
    { name: 'Bangkok', region: 'Central Thailand' },
    { name: 'Phuket', region: 'Southern Thailand' },
    { name: 'Chiang Mai', region: 'Northern Thailand' },
    { name: 'Pattaya', region: 'Eastern Thailand' },
    { name: 'Krabi', region: 'Southern Thailand' },
    { name: 'Koh Samui', region: 'Southern Thailand' },
  ],
  'India': [
    { name: 'Mumbai', region: 'Maharashtra' },
    { name: 'Delhi', region: 'Delhi' },
    { name: 'Bangalore', region: 'Karnataka' },
    { name: 'Goa', region: 'Goa' },
    { name: 'Jaipur', region: 'Rajasthan' },
    { name: 'Agra', region: 'Uttar Pradesh' },
  ],
  'UAE': [
    { name: 'Dubai', region: 'Dubai' },
    { name: 'Abu Dhabi', region: 'Abu Dhabi' },
    { name: 'Sharjah', region: 'Sharjah' },
  ],
  'Singapore': [
    { name: 'Singapore', region: 'Central Region' },
  ],
  'Indonesia': [
    { name: 'Bali', region: 'Bali' },
    { name: 'Jakarta', region: 'Java' },
    { name: 'Yogyakarta', region: 'Java' },
    { name: 'Lombok', region: 'West Nusa Tenggara' },
  ],
  'Greece': [
    { name: 'Athens', region: 'Attica' },
    { name: 'Santorini', region: 'Cyclades' },
    { name: 'Mykonos', region: 'Cyclades' },
    { name: 'Crete', region: 'Crete' },
    { name: 'Rhodes', region: 'Dodecanese' },
  ],
  'Netherlands': [
    { name: 'Amsterdam', region: 'North Holland' },
    { name: 'Rotterdam', region: 'South Holland' },
    { name: 'The Hague', region: 'South Holland' },
    { name: 'Utrecht', region: 'Utrecht' },
  ],
  'Switzerland': [
    { name: 'Zurich', region: 'Zürich' },
    { name: 'Geneva', region: 'Geneva' },
    { name: 'Lucerne', region: 'Lucerne' },
    { name: 'Interlaken', region: 'Bern' },
    { name: 'Zermatt', region: 'Valais' },
  ],
  'Canada': [
    { name: 'Toronto', region: 'Ontario' },
    { name: 'Vancouver', region: 'British Columbia' },
    { name: 'Montreal', region: 'Quebec' },
    { name: 'Calgary', region: 'Alberta' },
    { name: 'Ottawa', region: 'Ontario' },
  ],
  'Mexico': [
    { name: 'Mexico City', region: 'CDMX' },
    { name: 'Cancun', region: 'Quintana Roo' },
    { name: 'Playa del Carmen', region: 'Quintana Roo' },
    { name: 'Puerto Vallarta', region: 'Jalisco' },
    { name: 'Guadalajara', region: 'Jalisco' },
  ],
  'Brazil': [
    { name: 'Rio de Janeiro', region: 'Rio de Janeiro' },
    { name: 'São Paulo', region: 'São Paulo' },
    { name: 'Salvador', region: 'Bahia' },
    { name: 'Florianópolis', region: 'Santa Catarina' },
  ],
  'Portugal': [
    { name: 'Lisbon', region: 'Lisbon' },
    { name: 'Porto', region: 'Porto' },
    { name: 'Faro', region: 'Algarve' },
    { name: 'Sintra', region: 'Lisbon' },
  ],
  'Turkey': [
    { name: 'Istanbul', region: 'Marmara' },
    { name: 'Antalya', region: 'Mediterranean' },
    { name: 'Cappadocia', region: 'Central Anatolia' },
    { name: 'Bodrum', region: 'Aegean' },
  ],
  'Morocco': [
    { name: 'Marrakech', region: 'Marrakech-Safi' },
    { name: 'Casablanca', region: 'Casablanca-Settat' },
    { name: 'Fes', region: 'Fès-Meknès' },
    { name: 'Chefchaouen', region: 'Tanger-Tétouan-Al Hoceïma' },
  ],
  'Egypt': [
    { name: 'Cairo', region: 'Cairo' },
    { name: 'Luxor', region: 'Luxor' },
    { name: 'Hurghada', region: 'Red Sea' },
    { name: 'Sharm El Sheikh', region: 'South Sinai' },
  ],
  'South Africa': [
    { name: 'Cape Town', region: 'Western Cape' },
    { name: 'Johannesburg', region: 'Gauteng' },
    { name: 'Durban', region: 'KwaZulu-Natal' },
    { name: 'Kruger National Park', region: 'Mpumalanga' },
  ],
  'New Zealand': [
    { name: 'Auckland', region: 'Auckland' },
    { name: 'Queenstown', region: 'Otago' },
    { name: 'Wellington', region: 'Wellington' },
    { name: 'Rotorua', region: 'Bay of Plenty' },
  ],
  'South Korea': [
    { name: 'Seoul', region: 'Seoul' },
    { name: 'Busan', region: 'Busan' },
    { name: 'Jeju Island', region: 'Jeju' },
    { name: 'Incheon', region: 'Incheon' },
  ],
  'Vietnam': [
    { name: 'Ho Chi Minh City', region: 'Southeast' },
    { name: 'Hanoi', region: 'Red River Delta' },
    { name: 'Da Nang', region: 'South Central Coast' },
    { name: 'Hoi An', region: 'South Central Coast' },
  ],
  'Malaysia': [
    { name: 'Kuala Lumpur', region: 'Federal Territory' },
    { name: 'Penang', region: 'Penang' },
    { name: 'Langkawi', region: 'Kedah' },
    { name: 'Kota Kinabalu', region: 'Sabah' },
  ],
  'Philippines': [
    { name: 'Manila', region: 'Metro Manila' },
    { name: 'Cebu', region: 'Central Visayas' },
    { name: 'Boracay', region: 'Western Visayas' },
    { name: 'Palawan', region: 'Mimaropa' },
  ],
  'China': [
    { name: 'Beijing', region: 'Beijing' },
    { name: 'Shanghai', region: 'Shanghai' },
    { name: 'Hong Kong', region: 'Hong Kong' },
    { name: 'Shenzhen', region: 'Guangdong' },
    { name: 'Chengdu', region: 'Sichuan' },
    { name: 'Xi\'an', region: 'Shaanxi' },
    { name: 'Guilin', region: 'Guangxi' },
  ],
  'Russia': [
    { name: 'Moscow', region: 'Moscow' },
    { name: 'Saint Petersburg', region: 'Northwestern' },
    { name: 'Sochi', region: 'Krasnodar' },
  ],
  'Argentina': [
    { name: 'Buenos Aires', region: 'Buenos Aires' },
    { name: 'Mendoza', region: 'Mendoza' },
    { name: 'Bariloche', region: 'Río Negro' },
    { name: 'Iguazu', region: 'Misiones' },
  ],
  'Peru': [
    { name: 'Lima', region: 'Lima' },
    { name: 'Cusco', region: 'Cusco' },
    { name: 'Machu Picchu', region: 'Cusco' },
    { name: 'Arequipa', region: 'Arequipa' },
  ],
  'Colombia': [
    { name: 'Bogotá', region: 'Cundinamarca' },
    { name: 'Medellín', region: 'Antioquia' },
    { name: 'Cartagena', region: 'Bolívar' },
  ],
  'Ireland': [
    { name: 'Dublin', region: 'Leinster' },
    { name: 'Cork', region: 'Munster' },
    { name: 'Galway', region: 'Connacht' },
  ],
  'Austria': [
    { name: 'Vienna', region: 'Vienna' },
    { name: 'Salzburg', region: 'Salzburg' },
    { name: 'Innsbruck', region: 'Tyrol' },
  ],
  'Czech Republic': [
    { name: 'Prague', region: 'Bohemia' },
    { name: 'Brno', region: 'Moravia' },
    { name: 'Český Krumlov', region: 'Bohemia' },
  ],
  'Hungary': [
    { name: 'Budapest', region: 'Central Hungary' },
    { name: 'Debrecen', region: 'Northern Great Plain' },
  ],
  'Poland': [
    { name: 'Warsaw', region: 'Masovia' },
    { name: 'Kraków', region: 'Lesser Poland' },
    { name: 'Gdańsk', region: 'Pomerania' },
    { name: 'Wrocław', region: 'Lower Silesia' },
  ],
  'Sweden': [
    { name: 'Stockholm', region: 'Stockholm' },
    { name: 'Gothenburg', region: 'Västra Götaland' },
    { name: 'Malmö', region: 'Skåne' },
  ],
  'Norway': [
    { name: 'Oslo', region: 'Eastern Norway' },
    { name: 'Bergen', region: 'Western Norway' },
    { name: 'Tromsø', region: 'Northern Norway' },
  ],
  'Denmark': [
    { name: 'Copenhagen', region: 'Zealand' },
    { name: 'Aarhus', region: 'Jutland' },
  ],
  'Finland': [
    { name: 'Helsinki', region: 'Uusimaa' },
    { name: 'Rovaniemi', region: 'Lapland' },
  ],
  'Belgium': [
    { name: 'Brussels', region: 'Brussels' },
    { name: 'Bruges', region: 'Flanders' },
    { name: 'Antwerp', region: 'Flanders' },
    { name: 'Ghent', region: 'Flanders' },
  ],
  'Croatia': [
    { name: 'Dubrovnik', region: 'Dalmatia' },
    { name: 'Split', region: 'Dalmatia' },
    { name: 'Zagreb', region: 'Central Croatia' },
    { name: 'Plitvice Lakes', region: 'Lika' },
  ],
  'Iceland': [
    { name: 'Reykjavik', region: 'Capital Region' },
    { name: 'Akureyri', region: 'Northeastern' },
  ],
  'Israel': [
    { name: 'Tel Aviv', region: 'Tel Aviv District' },
    { name: 'Jerusalem', region: 'Jerusalem District' },
    { name: 'Haifa', region: 'Haifa District' },
  ],
  'Jordan': [
    { name: 'Amman', region: 'Amman' },
    { name: 'Petra', region: 'Ma\'an' },
    { name: 'Dead Sea', region: 'Karak' },
  ],
  'Sri Lanka': [
    { name: 'Colombo', region: 'Western' },
    { name: 'Kandy', region: 'Central' },
    { name: 'Galle', region: 'Southern' },
    { name: 'Ella', region: 'Uva' },
  ],
  'Nepal': [
    { name: 'Kathmandu', region: 'Bagmati' },
    { name: 'Pokhara', region: 'Gandaki' },
  ],
  'Maldives': [
    { name: 'Malé', region: 'Malé' },
    { name: 'Maafushi', region: 'Kaafu Atoll' },
  ],
  'Kenya': [
    { name: 'Nairobi', region: 'Nairobi' },
    { name: 'Mombasa', region: 'Coast' },
    { name: 'Masai Mara', region: 'Narok' },
  ],
  'Tanzania': [
    { name: 'Dar es Salaam', region: 'Dar es Salaam' },
    { name: 'Zanzibar', region: 'Zanzibar' },
    { name: 'Serengeti', region: 'Mara' },
  ],
};

// Helper to detect if selection is a country
const detectCountry = (value) => {
  if (!value) return null;
  const lowerValue = value.toLowerCase().trim();
  
  // Check for exact country matches at the end (e.g., "Tokyo, Japan" -> Japan)
  for (const country of Object.keys(CITIES_BY_COUNTRY)) {
    const lowerCountry = country.toLowerCase();
    // Match exact country name or country at the end after comma
    if (lowerValue === lowerCountry || 
        lowerValue.endsWith(`, ${lowerCountry}`) ||
        lowerValue.endsWith(`,${lowerCountry}`)) {
      return country;
    }
  }
  
  // Check for common country name variations
  const countryAliases = {
    'united states': 'USA',
    'united states of america': 'USA',
    'america': 'USA',
    'usa': 'USA',
    'uk': 'United Kingdom',
    'britain': 'United Kingdom',
    'great britain': 'United Kingdom',
    'england': 'United Kingdom',
    'holland': 'Netherlands',
    'the netherlands': 'Netherlands',
    'uae': 'UAE',
    'emirates': 'UAE',
    'united arab emirates': 'UAE',
  };
  
  for (const [alias, country] of Object.entries(countryAliases)) {
    if (lowerValue === alias || 
        lowerValue.endsWith(`, ${alias}`) ||
        lowerValue.endsWith(`,${alias}`)) {
      return country;
    }
  }
  
  return null;
};

// Check if a value is just a country (no city specified)
const isCountryOnly = (value) => {
  if (!value) return false;
  const lowerValue = value.toLowerCase().trim();
  
  // Check exact matches
  for (const country of Object.keys(CITIES_BY_COUNTRY)) {
    if (lowerValue === country.toLowerCase()) return true;
  }
  
  // Check aliases
  const countryAliases = ['united states', 'united states of america', 'america', 'usa', 
                          'uk', 'britain', 'great britain', 'england', 'holland', 
                          'the netherlands', 'uae', 'emirates', 'united arab emirates'];
  return countryAliases.includes(lowerValue);
};

const DestinationAutocomplete = ({
  value,
  onChange,
  placeholder = "Paris, Tokyo, Bali...",
  className,
  inputClassName,
  "data-testid": testId = "input-destination"
}) => {
  const { isLight } = useTheme();
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const containerRef = useRef(null);
  const touchStartRef = useRef(null);
  const isSelectingRef = useRef(false);
  
  // Debounce search query for performance
  const debouncedSearch = useDebounce(inputValue, 200);

  // Sync external value changes
  useEffect(() => {
    if (value !== inputValue && !isFocused) {
      setInputValue(value || '');
    }
  }, [value]);

  // Fetch suggestions when debounced search changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(`${API}/places/autocomplete`, {
          params: { query: debouncedSearch }
        });
        
        let results = [];
        
        // Check if user is typing a country name we support
        const lowerSearch = debouncedSearch.toLowerCase().trim();
        const matchedCountries = Object.keys(CITIES_BY_COUNTRY).filter(country => 
          country.toLowerCase().startsWith(lowerSearch) ||
          country.toLowerCase().includes(lowerSearch)
        );
        
        // Add matched countries at the top with "Explore cities" option
        if (matchedCountries.length > 0) {
          const countryOptions = matchedCountries.slice(0, 2).map(country => ({
            description: country,
            place_id: `country_${country.toLowerCase().replace(/\s/g, '_')}`,
            structured_formatting: {
              main_text: country,
              secondary_text: `${CITIES_BY_COUNTRY[country].length} popular cities`
            },
            types: ['country'],
            isCountryOption: true
          }));
          results = [...countryOptions];
        }
        
        if (response.data?.predictions) {
          // Filter out duplicates and add API results
          const apiResults = response.data.predictions.filter(p => 
            !matchedCountries.some(c => p.description.toLowerCase() === c.toLowerCase())
          ).slice(0, 5);
          results = [...results, ...apiResults];
          
          if (results.length > 0 && isFocused) {
            setIsOpen(true);
          }
        }
        
        setSuggestions(results.slice(0, 6));
      } catch (error) {
        console.error('Autocomplete error:', error);
        // Fallback suggestions based on common destinations
        const fallbackSuggestions = getFallbackSuggestions(debouncedSearch);
        setSuggestions(fallbackSuggestions);
        if (fallbackSuggestions.length > 0 && isFocused) {
          setIsOpen(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearch, isFocused]);

  // Fallback suggestions for offline/error scenarios
  const getFallbackSuggestions = (query) => {
    const popularDestinations = [
      { description: 'Paris, France', place_id: 'paris' },
      { description: 'Tokyo, Japan', place_id: 'tokyo' },
      { description: 'New York, USA', place_id: 'newyork' },
      { description: 'London, United Kingdom', place_id: 'london' },
      { description: 'Dubai, UAE', place_id: 'dubai' },
      { description: 'Bali, Indonesia', place_id: 'bali' },
      { description: 'Rome, Italy', place_id: 'rome' },
      { description: 'Barcelona, Spain', place_id: 'barcelona' },
      { description: 'Sydney, Australia', place_id: 'sydney' },
      { description: 'Singapore', place_id: 'singapore' },
      { description: 'Bangkok, Thailand', place_id: 'bangkok' },
      { description: 'Amsterdam, Netherlands', place_id: 'amsterdam' },
      { description: 'Los Angeles, USA', place_id: 'losangeles' },
      { description: 'Miami, USA', place_id: 'miami' },
      { description: 'Maldives', place_id: 'maldives' },
      { description: 'Santorini, Greece', place_id: 'santorini' },
      { description: 'Kyoto, Japan', place_id: 'kyoto' },
      { description: 'Prague, Czech Republic', place_id: 'prague' },
      { description: 'Vienna, Austria', place_id: 'vienna' },
      { description: 'Marrakech, Morocco', place_id: 'marrakech' }
    ];

    const lowerQuery = query.toLowerCase();
    return popularDestinations
      .filter(dest => dest.description.toLowerCase().includes(lowerQuery))
      .slice(0, 6);
  };

  // Handle selection of a suggestion
  const handleSelect = useCallback((suggestion, isCity = false) => {
    isSelectingRef.current = true;
    const selectedValue = suggestion.description || suggestion.name || suggestion;
    
    // Check if this is a country selection (to show city options)
    const detectedCountryFromSelection = detectCountry(selectedValue);
    const isOnlyCountry = isCountryOnly(selectedValue);
    
    // Show city options if:
    // 1. User selected just a country name (e.g., "Japan", "France")
    // 2. OR the place types include 'country'
    // 3. We have cities for this country
    const shouldShowCities = (isOnlyCountry || suggestion.types?.includes('country')) && 
                             !isCity && 
                             detectedCountryFromSelection &&
                             CITIES_BY_COUNTRY[detectedCountryFromSelection];
    
    if (shouldShowCities) {
      // User selected a country - show city options
      setSelectedCountry(detectedCountryFromSelection);
      setShowCitySuggestions(true);
      setInputValue(detectedCountryFromSelection); // Use clean country name
      setHighlightedIndex(-1);
      
      // Show city suggestions
      const cities = CITIES_BY_COUNTRY[detectedCountryFromSelection];
      const citySuggestions = cities.map(city => ({
        description: `${city.name}, ${detectedCountryFromSelection}`,
        place_id: `city_${city.name.toLowerCase().replace(/\s/g, '_')}`,
        structured_formatting: {
          main_text: city.name,
          secondary_text: `${city.region}, ${detectedCountryFromSelection}`
        },
        isCity: true,
        cityData: city
      }));
      setSuggestions(citySuggestions);
      setIsOpen(true);
      
      // Don't call onChange yet - let user pick a city
    } else {
      // Regular selection (city or specific place)
      setInputValue(selectedValue);
      onChange(selectedValue);
      setSuggestions([]);
      setIsOpen(false);
      setHighlightedIndex(-1);
      setSelectedCountry(null);
      setShowCitySuggestions(false);
      
      // Blur input after selection on mobile to hide keyboard
      if (window.innerWidth < 768) {
        inputRef.current?.blur();
      }
    }
    
    // Reset selecting flag after a short delay
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 100);
  }, [onChange]);
  
  // Handle city selection from country view
  const handleCitySelect = useCallback((city) => {
    handleSelect(city, true);
  }, [handleSelect]);
  
  // Go back to regular search from city view
  const handleBackToSearch = useCallback(() => {
    setSelectedCountry(null);
    setShowCitySuggestions(false);
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setHighlightedIndex(-1);
    
    if (newValue.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setSuggestions([]);
    }
    
    // Also update parent for cases where user types without selecting
    onChange(newValue);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelect(suggestions[highlightedIndex]);
        } else if (suggestions.length > 0) {
          handleSelect(suggestions[0]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
      case 'Tab':
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelect(suggestions[highlightedIndex]);
        }
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    if (inputValue.length >= 2 && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  // Handle blur with delay to allow click selection
  const handleBlur = (e) => {
    // Don't close if clicking on a suggestion
    if (isSelectingRef.current) {
      return;
    }
    
    // Delay closing to allow touch/click events to complete
    setTimeout(() => {
      if (!isSelectingRef.current) {
        setIsFocused(false);
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }, 200);
  };

  // Handle touch start for mobile
  const handleTouchStart = (e, suggestion) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    isSelectingRef.current = true;
  };

  // Handle touch end for mobile
  const handleTouchEnd = (e, suggestion) => {
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    
    // Only select if it was a tap, not a scroll
    if (deltaX < 10 && deltaY < 10) {
      e.preventDefault();
      e.stopPropagation();
      handleSelect(suggestion);
    }
    
    touchStartRef.current = null;
  };

  // Handle mouse down on suggestion (prevent blur)
  const handleMouseDown = (e) => {
    e.preventDefault();
    isSelectingRef.current = true;
  };

  // Handle click on suggestion
  const handleClick = (e, suggestion) => {
    e.preventDefault();
    e.stopPropagation();
    handleSelect(suggestion);
  };

  // Clear input
  const handleClear = () => {
    setInputValue('');
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedCountry(null);
    setShowCitySuggestions(false);
    inputRef.current?.focus();
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Input field */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "pl-4 sm:pl-5 pr-10 h-12 sm:h-14 text-base sm:text-lg bg-white/5 border-white/10 rounded-xl",
            "focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
            inputClassName
          )}
          data-testid={testId}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls="destination-suggestions"
        />
        
        {/* Loading/Clear indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
          {inputValue && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-white/10 transition-colors touch-manipulation"
              aria-label="Clear destination"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          id="destination-suggestions"
          ref={listRef}
          className={cn(
            "absolute z-[100] w-full mt-2 py-2 rounded-xl shadow-2xl max-h-[320px] overflow-y-auto overscroll-contain",
            isLight 
              ? "bg-white border border-gray-200" 
              : "bg-[#0a0a0f] border border-white/20"
          )}
          style={{ 
            backdropFilter: 'blur(20px)',
          }}
          role="listbox"
          aria-label="Destination suggestions"
        >
          {/* City selection header */}
          {showCitySuggestions && selectedCountry && (
            <div className={cn(
              "px-4 py-2 border-b mb-2",
              isLight ? "border-gray-200" : "border-white/10"
            )}>
              <button
                onClick={handleBackToSearch}
                className={cn(
                  "flex items-center gap-2 text-sm transition-colors",
                  isLight 
                    ? "text-gray-500 hover:text-gray-900" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span>Back to search</span>
              </button>
              <div className="flex items-center gap-2 mt-2">
                <Globe className="w-4 h-4 text-primary" />
                <span className={cn(
                  "text-sm font-medium",
                  isLight ? "text-gray-900" : "text-foreground"
                )}>Popular cities in {selectedCountry}</span>
              </div>
            </div>
          )}
          
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id || index}
              role="option"
              aria-selected={highlightedIndex === index}
              className={cn(
                "px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors",
                "touch-manipulation select-none",
                highlightedIndex === index 
                  ? "bg-primary/20" 
                  : isLight ? "hover:bg-gray-100" : "hover:bg-white/10",
                isLight ? "text-gray-900" : "text-foreground/90",
                suggestion.isCountryOption && "border-l-4 border-primary"
              )}
              onMouseDown={handleMouseDown}
              onClick={(e) => suggestion.isCity ? handleCitySelect(suggestion) : handleClick(e, suggestion)}
              onTouchStart={(e) => handleTouchStart(e, suggestion)}
              onTouchEnd={(e) => handleTouchEnd(e, suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {suggestion.isCity ? (
                <Building2 className="w-4 h-4 text-primary shrink-0" />
              ) : suggestion.isCountryOption ? (
                <Globe className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <MapPin className="w-4 h-4 text-primary shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm sm:text-base truncate font-medium",
                  isLight ? "text-gray-900" : "text-foreground"
                )}>
                  {suggestion.structured_formatting?.main_text || 
                   suggestion.description?.split(',')[0] || 
                   suggestion.description}
                </p>
                {suggestion.structured_formatting?.secondary_text && (
                  <p className={cn(
                    "text-xs truncate",
                    isLight ? "text-gray-500" : "text-muted-foreground"
                  )}>
                    {suggestion.structured_formatting.secondary_text}
                  </p>
                )}
              </div>
              {suggestion.isCountryOption && (
                <div className={cn(
                  "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                  isLight 
                    ? "bg-primary/10 text-primary" 
                    : "bg-primary/20 text-primary"
                )}>
                  <span>Explore cities</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              )}
              {!suggestion.isCity && !suggestion.isCountryOption && isCountryOnly(suggestion.description) && detectCountry(suggestion.description) && (
                <div className={cn(
                  "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                  isLight 
                    ? "bg-primary/10 text-primary" 
                    : "bg-primary/20 text-primary"
                )}>
                  <Globe className="w-3 h-3" />
                  <span>Cities</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && inputValue.length >= 2 && !isLoading && suggestions.length === 0 && (
        <div
          className={cn(
            "absolute z-[100] w-full mt-2 py-4 px-4 rounded-xl shadow-2xl text-center",
            isLight 
              ? "bg-white border border-gray-200" 
              : "bg-[#0a0a0f] border border-white/20"
          )}
          style={{ 
            backdropFilter: 'blur(20px)',
          }}
        >
          <Search className={cn(
            "w-6 h-6 mx-auto mb-2",
            isLight ? "text-gray-400" : "text-muted-foreground"
          )} />
          <p className={cn(
            "text-sm",
            isLight ? "text-gray-600" : "text-muted-foreground"
          )}>
            No destinations found for "{inputValue}"
          </p>
          <p className={cn(
            "text-xs mt-1",
            isLight ? "text-gray-500" : "text-muted-foreground"
          )}>
            Try a different search term
          </p>
        </div>
      )}
    </div>
  );
};

export default DestinationAutocomplete;
