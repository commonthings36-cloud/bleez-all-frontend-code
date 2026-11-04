import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { cn } from '../lib/utils';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Curated business visuals - NO FOOD IMAGES
const BUSINESS_VISUALS = [
  {
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80",
    title: "Modern Conference Room"
  },
  {
    url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1920&q=80",
    title: "Corporate Boardroom"
  },
  {
    url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80",
    title: "Business Workspace"
  },
  {
    url: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1920&q=80",
    title: "Professional Meeting"
  },
  {
    url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1920&q=80",
    title: "Executive Office"
  },
  {
    url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1920&q=80",
    title: "Team Collaboration"
  },
  {
    url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&q=80",
    title: "Business Discussion"
  },
  {
    url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80",
    title: "Data Analysis"
  },
  {
    url: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1920&q=80",
    title: "Video Conference"
  },
  {
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80",
    title: "Corporate Building"
  }
];

const BusinessMeetingVisual = ({ 
  className = "",
  variant = "background", // background, card, hero
  index = 0, // Which visual to show
  overlay = true,
  children
}) => {
  const [currentIndex, setCurrentIndex] = useState(index);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const visual = BUSINESS_VISUALS[currentIndex % BUSINESS_VISUALS.length];

  // Cycle through visuals for hero variant
  useEffect(() => {
    if (variant === 'hero') {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % BUSINESS_VISUALS.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [variant]);

  if (variant === 'card') {
    return (
      <div className={cn("relative rounded-2xl overflow-hidden", className)}>
        <img
          src={visual.url}
          alt={visual.title}
          className="w-full h-full object-cover"
          onLoad={() => setIsLoaded(true)}
        />
        {overlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        )}
        {children && (
          <div className="absolute inset-0 flex items-end p-4">
            {children}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={cn("relative min-h-[400px] overflow-hidden", className)}>
        <div 
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-opacity duration-1000",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          style={{ backgroundImage: `url(${visual.url})` }}
        />
        <img
          src={visual.url}
          alt={visual.title}
          className="hidden"
          onLoad={() => setIsLoaded(true)}
        />
        {overlay && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
          </>
        )}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }

  // Default background variant
  return (
    <div className={cn("relative", className)}>
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${visual.url})` }}
      />
      {overlay && (
        <div className="absolute inset-0 bg-background/90" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Meeting Section Header with professional visual
export const MeetingSectionHeader = ({ title, subtitle, time, venue }) => {
  const randomIndex = Math.floor(Math.random() * BUSINESS_VISUALS.length);
  
  return (
    <BusinessMeetingVisual 
      variant="card" 
      index={randomIndex}
      className="h-48 mb-6"
    >
      <div className="text-white">
        <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Business Meeting</p>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        {time && <p className="text-sm opacity-80">{time}</p>}
        {venue && (
          <p className="text-sm opacity-70 flex items-center gap-1 mt-1">
            📍 {venue}
          </p>
        )}
      </div>
    </BusinessMeetingVisual>
  );
};

// Grid of business visuals for selection
export const BusinessVisualsGrid = ({ onSelect, selectedIndex }) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {BUSINESS_VISUALS.map((visual, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(idx)}
          className={cn(
            "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
            selectedIndex === idx 
              ? "border-primary ring-2 ring-primary/50" 
              : "border-transparent hover:border-white/30"
          )}
        >
          <img
            src={visual.url}
            alt={visual.title}
            className="w-full h-full object-cover"
          />
          {selectedIndex === idx && (
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
              <span className="text-white text-lg">✓</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export { BUSINESS_VISUALS };
export default BusinessMeetingVisual;
