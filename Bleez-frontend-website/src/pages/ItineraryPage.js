import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar, Footer } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import {
  MapPin, Calendar, Clock, DollarSign, Sparkles, ExternalLink,
  Plane, Hotel, Car, Map, Star, Utensils, Camera, Heart,
  Loader2, Share2, Download, AlertTriangle, Briefcase,
  MessageCircle, Mail, Copy, Check, FileText, Cloud, Sun, 
  CloudRain, Droplets, Wind, Navigation, ChevronRight,
  CalendarPlus
} from 'lucide-react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import MeetingIntelligence from '../components/MeetingIntelligence';
import BusinessMeetingVisual, { MeetingSectionHeader } from '../components/BusinessMeetingVisual';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ItineraryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { formatAmount, currencySymbol } = useCurrency();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(0);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Format temperature to show both Celsius and Fahrenheit
  const formatTemp = (celsius) => {
    if (!celsius && celsius !== 0) return '--';
    const c = Math.round(celsius);
    const f = Math.round((celsius * 9/5) + 32);
    return `${c}°C / ${f}°F`;
  };

  // Format temperature range to show both units
  const formatTempRange = (minC, maxC) => {
    if ((!minC && minC !== 0) || (!maxC && maxC !== 0)) return '--';
    const minCRound = Math.round(minC);
    const maxCRound = Math.round(maxC);
    const minF = Math.round((minC * 9/5) + 32);
    const maxF = Math.round((maxC * 9/5) + 32);
    return `${minCRound}°-${maxCRound}°C (${minF}°-${maxF}°F)`;
  };

  // Simple temp for compact display (both units)
  const formatTempCompact = (celsius) => {
    if (!celsius && celsius !== 0) return '--';
    const c = Math.round(celsius);
    const f = Math.round((celsius * 9/5) + 32);
    return `${c}°/${f}°`;
  };

  useEffect(() => {
    if (token) {
      fetchItinerary();
    }
  }, [id, token]);

  const fetchItinerary = async () => {
    try {
      const response = await axios.get(`${API}/itinerary/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setItinerary(response.data);
    } catch (error) {
      toast.error('Failed to load itinerary');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      sightseeing: Camera,
      food: Utensils,
      adventure: Star,
      culture: Heart,
      relaxation: Heart,
      family: Heart,
      business: Briefcase
    };
    return icons[category] || MapPin;
  };

  const bookingCategories = [
    { key: 'flights', label: 'Flights', icon: Plane },
    { key: 'hotels', label: 'Hotels', icon: Hotel },
    { key: 'transport', label: 'Transport', icon: Car },
    { key: 'activities', label: 'Activities', icon: Map }
  ];

  const copyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = () => {
    const shareUrl = window.location.href;
    const shareText = `🌍 Check out my ${itinerary?.destination} trip itinerary!\n\n` +
      `📅 ${itinerary?.start_date} - ${itinerary?.end_date}\n` +
      `🏷️ ${itinerary?.trip_type || 'leisure'} trip\n` +
      `✨ ${itinerary?.days?.length || 0} days of adventure!\n\n` +
      `View the full itinerary:`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
    toast.success('Opening WhatsApp...');
  };

  const shareToFacebook = () => {
    const shareUrl = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
    toast.success('Opening Facebook...');
  };

  const shareToTwitter = () => {
    const shareUrl = window.location.href;
    const shareText = `🌍 Just planned my ${itinerary?.destination} trip with Bleez! ` +
      `${itinerary?.days?.length || 0} days of adventure await! ✈️🗺️`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
    toast.success('Opening Twitter...');
  };

  const shareToLinkedIn = () => {
    const shareUrl = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
    toast.success('Opening LinkedIn...');
  };

  const shareToTelegram = () => {
    const shareUrl = window.location.href;
    const shareText = `🌍 Check out my ${itinerary?.destination} trip itinerary!`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
    toast.success('Opening Telegram...');
  };

  const shareByEmail = () => {
    const subject = `My ${itinerary?.destination} Trip Itinerary - Bleez`;
    const body = `Hi!\n\n` +
      `I planned an amazing trip to ${itinerary?.destination} using Bleez!\n\n` +
      `📅 Dates: ${itinerary?.start_date} - ${itinerary?.end_date}\n` +
      `🏷️ Trip type: ${itinerary?.trip_type || 'leisure'}\n` +
      `📍 Duration: ${itinerary?.days?.length || 0} days\n\n` +
      `Check out the full itinerary here:\n${window.location.href}\n\n` +
      `Happy travels! ✈️`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    toast.success('Opening email client...');
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${itinerary?.destination} Trip Itinerary`,
          text: `Check out my ${itinerary?.destination} trip itinerary! ${itinerary?.days?.length || 0} days of adventure!`,
          url: window.location.href,
        });
        toast.success('Shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      copyLink();
    }
  };

  // Reference for the printable content area
  const printableRef = useRef(null);

  // Helper function to load image as base64 with CORS handling
  const loadImageAsBase64 = (url) => {
    return new Promise((resolve) => {
      if (!url) {
        resolve(null);
        return;
      }
      
      // Try multiple approaches for CORS
      const tryLoadImage = (imageUrl, attempt = 1) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            // Limit image size for PDF
            const maxWidth = 800;
            const maxHeight = 600;
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
              height = (maxWidth / width) * height;
              width = maxWidth;
            }
            if (height > maxHeight) {
              width = (maxHeight / height) * width;
              height = maxHeight;
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          } catch (e) {
            console.log('Canvas error:', e);
            resolve(null);
          }
        };
        
        img.onerror = () => {
          if (attempt === 1 && url.includes('googleusercontent.com')) {
            // Try without CORS for Google images
            tryLoadImage(url.replace('=s', '=s400-'), 2);
          } else if (attempt < 3) {
            // Try with proxy
            const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=400&h=300&fit=cover&output=jpg`;
            tryLoadImage(proxyUrl, attempt + 1);
          } else {
            resolve(null);
          }
        };
        
        // Add cache buster
        const separator = imageUrl.includes('?') ? '&' : '?';
        img.src = `${imageUrl}${separator}_t=${Date.now()}`;
      };
      
      tryLoadImage(url);
    });
  };

  // Helper to sanitize text for PDF (remove special characters that cause encoding issues)
  const sanitizeText = (text) => {
    if (!text) return '';
    return text
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/[^\x20-\x7E\xA0-\xFF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/g, '') // Keep only common characters
      .replace(/[\u2018\u2019]/g, "'") // Smart quotes to regular
      .replace(/[\u201C\u201D]/g, '"') // Smart double quotes
      .replace(/\u2026/g, '...') // Ellipsis
      .replace(/\u2013/g, '-') // En dash
      .replace(/\u2014/g, '--') // Em dash
      .replace(/\u00A0/g, ' ') // Non-breaking space
      .trim();
  };

  const generateVisualPDF = async () => {
    if (!itinerary) {
      toast.error('No itinerary data available');
      return null;
    }

    setGeneratingPdf(true);
    toast.info('Generating PDF matching your itinerary view...', { duration: 15000 });

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Light Mode Colors (matching on-screen itinerary)
      const primaryColor = [212, 168, 83]; // Gold #D4A853
      const bgColor = [255, 255, 255]; // White background
      const cardBg = [250, 250, 252]; // Light gray card
      const textColor = [30, 41, 59]; // Dark text (slate-800)
      const mutedColor = [100, 116, 139]; // Muted text (slate-500)
      const accentBlue = [59, 130, 246]; // Blue accent
      const borderColor = [226, 232, 240]; // Light border

      // Helper to add new page if needed
      const checkNewPage = (neededHeight) => {
        if (yPosition + neededHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          // Add page background
          pdf.setFillColor(...bgColor);
          pdf.rect(0, 0, pageWidth, pageHeight, 'F');
          return true;
        }
        return false;
      };

      // Helper to draw horizontal line
      const drawDivider = () => {
        pdf.setDrawColor(...borderColor);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
      };

      // ===== COVER PAGE =====
      // White background
      pdf.setFillColor(...bgColor);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      // Try to add destination image
      const destImage = await loadImageAsBase64(itinerary.destination_image);
      if (destImage) {
        try {
          // Add image with rounded corners effect
          pdf.addImage(destImage, 'JPEG', margin, margin, contentWidth, 80);
          // Add subtle shadow effect under image
          pdf.setFillColor(0, 0, 0);
          pdf.setGState(new pdf.GState({ opacity: 0.1 }));
          pdf.roundedRect(margin + 2, margin + 78, contentWidth - 4, 5, 2, 2, 'F');
          pdf.setGState(new pdf.GState({ opacity: 1 }));
        } catch (e) {
          console.log('Could not add destination image');
        }
      }

      // Title section
      yPosition = destImage ? 110 : 50;
      
      // Gold accent line
      pdf.setFillColor(...primaryColor);
      pdf.rect(pageWidth / 2 - 30, yPosition, 60, 2, 'F');
      yPosition += 15;

      // Destination name
      pdf.setFontSize(32);
      pdf.setTextColor(...textColor);
      pdf.setFont(undefined, 'bold');
      const destName = sanitizeText(itinerary.destinations?.length > 1 
        ? itinerary.destinations.join(' - ') 
        : itinerary.destination || 'Your Trip');
      pdf.text(destName, pageWidth / 2, yPosition, { align: 'center', maxWidth: contentWidth });
      pdf.setFont(undefined, 'normal');

      // Trip type subtitle
      yPosition += 12;
      pdf.setFontSize(14);
      pdf.setTextColor(...mutedColor);
      const tripType = itinerary.trip_type === 'business' ? 'Business Trip' : 'Travel Itinerary';
      pdf.text(tripType, pageWidth / 2, yPosition, { align: 'center' });

      // Dates
      yPosition += 12;
      pdf.setFontSize(12);
      pdf.setTextColor(...textColor);
      const startDate = itinerary.start_date ? new Date(itinerary.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
      const endDate = itinerary.end_date ? new Date(itinerary.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
      const dateText = startDate && endDate ? `${startDate} - ${endDate}` : '';
      pdf.text(dateText, pageWidth / 2, yPosition, { align: 'center' });

      // Trip info card
      yPosition += 20;
      const days = itinerary.itinerary?.length || itinerary.days?.length || 0;
      pdf.setFillColor(...cardBg);
      pdf.setDrawColor(...borderColor);
      pdf.roundedRect(margin + 30, yPosition - 5, contentWidth - 60, 25, 4, 4, 'FD');
      
      pdf.setFontSize(11);
      pdf.setTextColor(...textColor);
      pdf.text(`${days} Days - ${itinerary.travelers_count || 1} Travelers`, pageWidth / 2, yPosition + 8, { align: 'center' });

      // Weather info
      if (itinerary.weather_forecast?.[0]) {
        yPosition += 30;
        const weather = itinerary.weather_forecast[0];
        const tempC = Math.round(weather.temp_c || weather.max_temp_c || 0);
        const tempF = Math.round((tempC * 9/5) + 32);
        pdf.setFontSize(10);
        pdf.setTextColor(...mutedColor);
        const weatherText = `Expected Weather: ${weather.condition || 'Varied'} • ${tempC}°C / ${tempF}°F`;
        pdf.text(weatherText, pageWidth / 2, yPosition, { align: 'center' });
      }

      // AI explanation
      if (itinerary.ai_explanation) {
        yPosition += 25;
        pdf.setFillColor(253, 250, 240); // Warm beige background
        pdf.setDrawColor(...primaryColor);
        const explanationText = sanitizeText(itinerary.ai_explanation);
        const explanationLines = pdf.splitTextToSize(explanationText, contentWidth - 30);
        const boxHeight = Math.min(explanationLines.length * 5 + 15, 45);
        pdf.roundedRect(margin + 10, yPosition - 5, contentWidth - 20, boxHeight, 4, 4, 'FD');
        pdf.setFontSize(10);
        pdf.setTextColor(...mutedColor);
        pdf.setFont(undefined, 'italic');
        pdf.text(explanationLines.slice(0, 5), pageWidth / 2, yPosition + 5, { align: 'center', maxWidth: contentWidth - 40 });
        pdf.setFont(undefined, 'normal');
      }

      // Footer on cover
      pdf.setFontSize(14);
      pdf.setTextColor(...primaryColor);
      pdf.setFont(undefined, 'bold');
      pdf.text('Bleez', pageWidth / 2, pageHeight - 30, { align: 'center' });
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(...mutedColor);
      pdf.text('Your Intelligent Travel Companion', pageWidth / 2, pageHeight - 22, { align: 'center' });
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

      // ===== DAY PAGES =====
      const allDays = itinerary.itinerary || itinerary.days || [];
      
      for (let dayIndex = 0; dayIndex < allDays.length; dayIndex++) {
        const day = allDays[dayIndex];
        
        // New page for each day
        pdf.addPage();
        yPosition = margin;

        // White background
        pdf.setFillColor(...bgColor);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        // Day header card
        pdf.setFillColor(...cardBg);
        pdf.setDrawColor(...borderColor);
        pdf.roundedRect(margin, yPosition, contentWidth, 30, 4, 4, 'FD');

        // Day number badge
        pdf.setFillColor(...primaryColor);
        pdf.roundedRect(margin + 8, yPosition + 6, 45, 18, 3, 3, 'F');
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(255, 255, 255);
        pdf.text(`DAY ${day.day || dayIndex + 1}`, margin + 30.5, yPosition + 17, { align: 'center' });
        pdf.setFont(undefined, 'normal');

        // Day theme/title
        pdf.setFontSize(14);
        pdf.setTextColor(...textColor);
        const dayTitle = sanitizeText(day.theme || day.title || day.city || `Day ${dayIndex + 1}`);
        pdf.text(dayTitle, margin + 60, yPosition + 18, { maxWidth: contentWidth - 70 });

        // Date for this day
        if (day.date) {
          pdf.setFontSize(9);
          pdf.setTextColor(...mutedColor);
          const dayDate = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          pdf.text(dayDate, pageWidth - margin - 10, yPosition + 18, { align: 'right' });
        }

        yPosition += 40;

        // Activities
        const activities = day.activities || [];
        for (let actIdx = 0; actIdx < activities.length; actIdx++) {
          const activity = activities[actIdx];
          const placeDetails = activity.place_details;
          const hasImage = placeDetails?.photos?.length > 0;
          const isMeeting = activity.category === 'meeting' || activity.type === 'meeting' || activity.category === 'business';
          
          // Calculate card height based on content
          let cardHeight = 55;
          if (hasImage) cardHeight = 70;
          if (activity.description) cardHeight += 8;
          
          checkNewPage(cardHeight + 10);

          // Try to load activity image with multiple fallback options
          let activityImage = null;
          const photoUrl = placeDetails?.photos?.[0] || activity.image || activity.photo;
          if (photoUrl) {
            try {
              activityImage = await loadImageAsBase64(photoUrl);
              console.log(`Loaded image for ${activity.place_name || activity.title}`);
            } catch (e) {
              console.log('Could not load activity image:', e);
            }
          }

          // Activity card with light background
          pdf.setFillColor(...cardBg);
          pdf.setDrawColor(...borderColor);
          pdf.roundedRect(margin, yPosition, contentWidth, cardHeight, 4, 4, 'FD');

          // Left border accent
          pdf.setFillColor(...(isMeeting ? accentBlue : primaryColor));
          pdf.roundedRect(margin, yPosition, 4, cardHeight, 2, 0, 'F');

          let innerY = yPosition + 8;

          // Add image if available
          if (activityImage) {
            try {
              pdf.addImage(activityImage, 'JPEG', margin + 8, innerY - 2, 50, 38);
              // Rating badge on image
              if (placeDetails?.rating) {
                pdf.setFillColor(...primaryColor);
                pdf.roundedRect(margin + 10, innerY + 28, 22, 7, 2, 2, 'F');
                pdf.setFontSize(7);
                pdf.setTextColor(255, 255, 255);
                pdf.text(`* ${placeDetails.rating}`, margin + 21, innerY + 33, { align: 'center' });
              }
            } catch (e) {
              console.log('Could not add activity image to PDF');
            }
          }

          // Content area (adjusted based on image presence)
          const contentX = activityImage ? margin + 65 : margin + 12;
          const contentMaxWidth = activityImage ? contentWidth - 75 : contentWidth - 25;

          // Time badge
          pdf.setFillColor(240, 240, 245);
          pdf.roundedRect(contentX, innerY - 3, 45, 14, 3, 3, 'F');
          pdf.setFontSize(10);
          pdf.setTextColor(...primaryColor);
          pdf.setFont(undefined, 'bold');
          const timeText = activity.time || activity.start_time || '';
          pdf.text(timeText, contentX + 22.5, innerY + 5, { align: 'center' });
          pdf.setFont(undefined, 'normal');

          // Duration
          if (activity.duration) {
            pdf.setFontSize(9);
            pdf.setTextColor(...mutedColor);
            pdf.text(`${activity.duration}`, contentX + 50, innerY + 5);
          }

          // Meeting badge
          if (isMeeting) {
            pdf.setFillColor(...accentBlue);
            pdf.roundedRect(contentX + (activity.duration ? 80 : 50), innerY - 3, 30, 14, 3, 3, 'F');
            pdf.setFontSize(8);
            pdf.setTextColor(255, 255, 255);
            pdf.text('MEETING', contentX + (activity.duration ? 95 : 65), innerY + 5, { align: 'center' });
          }

          innerY += 18;

          // Title
          pdf.setFontSize(12);
          pdf.setFont(undefined, 'bold');
          pdf.setTextColor(...textColor);
          const title = sanitizeText(activity.place_name || activity.title || activity.name || '');
          pdf.text(title, contentX, innerY, { maxWidth: contentMaxWidth });
          pdf.setFont(undefined, 'normal');

          innerY += 8;

          // Description
          if (activity.description) {
            pdf.setFontSize(9);
            pdf.setTextColor(...mutedColor);
            const descText = sanitizeText(activity.description);
            const desc = pdf.splitTextToSize(descText, contentMaxWidth);
            pdf.text(desc.slice(0, 2).join(' '), contentX, innerY, { maxWidth: contentMaxWidth });
            innerY += 10;
          }

          // Location
          if (activity.location || placeDetails?.address) {
            pdf.setFontSize(8);
            pdf.setTextColor(120, 130, 150);
            const location = sanitizeText(activity.location || placeDetails?.address || '');
            pdf.text(`Location: ${location.substring(0, 55)}${location.length > 55 ? '...' : ''}`, contentX, innerY + 3);
          }

          // Website link
          if (placeDetails?.website) {
            pdf.setFontSize(8);
            pdf.setTextColor(...accentBlue);
            pdf.textWithLink('View Details', contentX + contentMaxWidth - 25, innerY + 3, { url: placeDetails.website });
          }

          yPosition += cardHeight + 6;
        }

        // Meals section
        const meals = day.meals || [];
        if (meals.length > 0) {
          checkNewPage(30 + meals.length * 25);

          yPosition += 8;
          pdf.setFontSize(12);
          pdf.setFont(undefined, 'bold');
          pdf.setTextColor(...primaryColor);
          pdf.text('DINING RECOMMENDATIONS', margin, yPosition);
          pdf.setFont(undefined, 'normal');
          yPosition += 12;

          for (const meal of meals) {
            checkNewPage(25);
            
            pdf.setFillColor(255, 251, 245); // Warm white for food
            pdf.setDrawColor(...primaryColor);
            pdf.roundedRect(margin, yPosition, contentWidth, 22, 3, 3, 'FD');

            // Meal type badge
            pdf.setFillColor(...primaryColor);
            pdf.roundedRect(margin + 5, yPosition + 4, 38, 14, 3, 3, 'F');
            pdf.setFontSize(8);
            pdf.setFont(undefined, 'bold');
            pdf.setTextColor(255, 255, 255);
            const mealType = (meal.type || 'Meal').toUpperCase();
            pdf.text(mealType, margin + 24, yPosition + 13, { align: 'center' });
            pdf.setFont(undefined, 'normal');

            // Restaurant name
            pdf.setFontSize(11);
            pdf.setTextColor(...textColor);
            pdf.text(sanitizeText(meal.restaurant || meal.name || ''), margin + 50, yPosition + 13);

            // Cuisine and price
            pdf.setFontSize(9);
            pdf.setTextColor(...mutedColor);
            const mealDetails = sanitizeText([meal.cuisine, meal.price_range].filter(Boolean).join(' - '));
            pdf.text(mealDetails, pageWidth - margin - 10, yPosition + 13, { align: 'right' });

            yPosition += 26;
          }
        }

        // Page footer
        pdf.setFontSize(9);
        pdf.setTextColor(...mutedColor);
        pdf.text(`Day ${day.day || dayIndex + 1} of ${allDays.length} - Bleez`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      // ===== TIPS PAGE =====
      const tips = itinerary.tips || itinerary.important_tips || [];
      if (tips.length > 0) {
        pdf.addPage();
        yPosition = margin;

        pdf.setFillColor(...bgColor);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        pdf.setFontSize(18);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(...textColor);
        pdf.text('TRAVEL TIPS & RECOMMENDATIONS', margin, yPosition + 10);
        pdf.setFont(undefined, 'normal');
        yPosition += 25;

        drawDivider();
        yPosition += 5;

        pdf.setFontSize(10);
        for (let i = 0; i < tips.length; i++) {
          const tip = sanitizeText(tips[i]);
          checkNewPage(20);
          
          // Tip number badge
          pdf.setFillColor(...primaryColor);
          pdf.circle(margin + 5, yPosition + 3, 4, 'F');
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'bold');
          pdf.setTextColor(255, 255, 255);
          pdf.text(`${i + 1}`, margin + 5, yPosition + 4.5, { align: 'center' });
          pdf.setFont(undefined, 'normal');
          
          // Tip text
          pdf.setFontSize(10);
          pdf.setTextColor(...textColor);
          const tipLines = pdf.splitTextToSize(tip, contentWidth - 25);
          pdf.text(tipLines, margin + 15, yPosition + 4);
          yPosition += tipLines.length * 5 + 10;
        }
      }

      // ===== BOOKING LINKS PAGE =====
      if (itinerary.booking_links && Object.keys(itinerary.booking_links).length > 0) {
        pdf.addPage();
        yPosition = margin;

        pdf.setFillColor(...bgColor);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        pdf.setFontSize(18);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(...textColor);
        pdf.text('BOOKING LINKS', margin, yPosition + 10);
        pdf.setFont(undefined, 'normal');
        yPosition += 25;

        drawDivider();
        yPosition += 5;

        for (const [category, links] of Object.entries(itinerary.booking_links)) {
          if (!links || links.length === 0) continue;

          checkNewPage(35);

          // Category header
          pdf.setFillColor(...cardBg);
          pdf.setDrawColor(...borderColor);
          pdf.roundedRect(margin, yPosition, contentWidth, 14, 3, 3, 'FD');
          pdf.setFontSize(11);
          pdf.setFont(undefined, 'bold');
          pdf.setTextColor(...primaryColor);
          pdf.text(sanitizeText(category.charAt(0).toUpperCase() + category.slice(1)), margin + 8, yPosition + 9);
          pdf.setFont(undefined, 'normal');
          yPosition += 18;

          for (const link of links) {
            checkNewPage(16);
            
            pdf.setFontSize(10);
            pdf.setTextColor(...textColor);
            const linkName = sanitizeText(link.name || 'Booking Link');
            pdf.text(linkName, margin + 8, yPosition);
            
            if (link.url) {
              // Add clickable link
              pdf.setTextColor(...accentBlue);
              const shortUrl = link.url.length > 50 ? link.url.substring(0, 50) + '...' : link.url;
              pdf.textWithLink('Link: ' + shortUrl, margin + 8, yPosition + 6, { url: link.url });
            }
            
            if (link.note) {
              pdf.setTextColor(...mutedColor);
              pdf.setFontSize(9);
              pdf.text(`Note: ${sanitizeText(link.note)}`, margin + 8, yPosition + 12);
              yPosition += 18;
            } else {
              yPosition += 14;
            }
          }
          yPosition += 5;
        }
      }

      // ===== FINAL PAGE =====
      pdf.addPage();
      pdf.setFillColor(...bgColor);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      // Decorative border with gold accent
      pdf.setDrawColor(...primaryColor);
      pdf.setLineWidth(1);
      pdf.roundedRect(margin + 5, margin + 5, contentWidth - 10, pageHeight - margin * 2 - 10, 8, 8, 'S');

      // Inner subtle border
      pdf.setDrawColor(...borderColor);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(margin + 10, margin + 10, contentWidth - 20, pageHeight - margin * 2 - 20, 6, 6, 'S');

      // Brand logo section
      pdf.setFontSize(32);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(...primaryColor);
      pdf.text('Bleez', pageWidth / 2, pageHeight / 2 - 25, { align: 'center' });
      pdf.setFont(undefined, 'normal');

      pdf.setFontSize(14);
      pdf.setTextColor(...textColor);
      pdf.text('Your Intelligent Travel Companion', pageWidth / 2, pageHeight / 2 - 5, { align: 'center' });

      // Thank you message
      pdf.setFontSize(12);
      pdf.setTextColor(...mutedColor);
      pdf.text('Thank you for using Bleez!', pageWidth / 2, pageHeight / 2 + 25, { align: 'center' });
      pdf.text('Have a wonderful trip!', pageWidth / 2, pageHeight / 2 + 38, { align: 'center' });

      // Footer with date
      pdf.setFontSize(9);
      pdf.setTextColor(...mutedColor);
      pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, pageHeight - 25, { align: 'center' });

      setGeneratingPdf(false);
      toast.success('PDF generated successfully!');
      return pdf;

    } catch (error) {
      console.error('PDF generation error:', error);
      setGeneratingPdf(false);
      toast.error('Failed to generate PDF');
      return null;
    }
  };

  const downloadPDF = async () => {
    const pdf = await generateVisualPDF();
    if (pdf) {
      const fileName = `${sanitizeText(itinerary?.destination || 'itinerary').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      toast.success('PDF downloaded successfully!');
    }
  };

  // Download calendar file (ICS)
  const downloadCalendar = async () => {
    try {
      toast.info('Generating calendar file...');
      
      const response = await axios.get(
        `${API}/itinerary/${id}/calendar.ics`,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          responseType: 'blob'
        }
      );
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trip-to-${itinerary?.destination?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'trip'}.ics`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Calendar file downloaded! Open it to add events to your calendar.');
    } catch (error) {
      console.error('Calendar download error:', error);
      toast.error('Failed to generate calendar file');
    }
  };

  // Navigate to trip's photo album
  const viewTripPhotos = async () => {
    try {
      // Get or create album for this trip
      const response = await axios.get(
        `${API}/itinerary/${id}/album`,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }
      );
      
      if (response.data?.id) {
        // Navigate to albums page with this album selected
        navigate(`/albums?selected=${response.data.id}`);
      } else {
        navigate('/albums');
      }
    } catch (error) {
      console.error('Failed to get trip album:', error);
      // Navigate to albums page anyway
      navigate('/albums');
    }
  };

  // Sync to Google Calendar directly
  const syncToGoogleCalendar = async () => {
    if (!token) {
      toast.error('Please login to sync with Google Calendar');
      return;
    }
    
    try {
      toast.info('Syncing with Google Calendar...');
      
      const response = await axios.post(
        `${API}/itinerary/${id}/add-to-google-calendar`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success(response.data.message || 'Synced to Google Calendar!');
      } else {
        toast.info(response.data.message || 'Sync completed');
      }
    } catch (error) {
      console.error('Google Calendar sync error:', error);
      const message = error.response?.data?.detail || 'Failed to sync with Google Calendar';
      
      if (error.response?.status === 400 && message.includes('connect')) {
        // User hasn't connected Google Calendar
        toast.error(message, {
          action: {
            label: 'Connect Now',
            onClick: () => navigate('/profile?tab=integrations')
          }
        });
      } else if (error.response?.status === 501) {
        // Not configured
        toast.info('Google Calendar sync not available. Use the .ics download instead.');
      } else {
        toast.error(message);
      }
    }
  };

  const generateAndSharePDF = async () => {
    const pdf = await generateVisualPDF();
    if (!pdf) return;

    try {
      const fileName = `${itinerary?.destination?.replace(/[^a-zA-Z0-9]/g, '_') || 'itinerary'}.pdf`;
      const pdfBlob = pdf.output('blob');
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

      if (navigator.share && navigator.canShare({ files: [pdfFile] })) {
        // Native share with PDF file
        await navigator.share({
          title: `${itinerary?.destination} Itinerary`,
          text: `Check out my trip itinerary to ${itinerary?.destination}!`,
          files: [pdfFile]
        });
        toast.success('Shared successfully!');
      } else {
        // Fallback: Download and show sharing instructions
        pdf.save(fileName);
        toast.success('PDF saved! You can now share it via WhatsApp, email, or social media.');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share error:', error);
        // Fallback to download
        const fileName = `${itinerary?.destination?.replace(/[^a-zA-Z0-9]/g, '_') || 'itinerary'}.pdf`;
        pdf.save(fileName);
        toast.info('PDF saved! Share it manually via your preferred app.');
      }
    }
  };

  const generatePDFContent = () => {
    const isBusiness = itinerary?.trip_type === 'business';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${itinerary?.destination} Itinerary - Bleez</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', 'Helvetica Neue', sans-serif; 
              padding: 40px; 
              max-width: 800px; 
              margin: 0 auto; 
              color: #1a1a1a;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              padding: 30px;
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
              color: white;
              border-radius: 15px;
              margin-bottom: 30px;
            }
            .header h1 { 
              font-size: 28px; 
              margin-bottom: 10px;
              color: #7C3AED;
            }
            .header .subtitle { font-size: 14px; opacity: 0.9; }
            .header .dates { 
              font-size: 16px; 
              margin-top: 15px;
              background: rgba(255,255,255,0.1);
              padding: 8px 20px;
              border-radius: 20px;
              display: inline-block;
            }
            .section { margin: 25px 0; }
            .section-title {
              font-size: 18px;
              color: #7C3AED;
              border-bottom: 2px solid #7C3AED;
              padding-bottom: 8px;
              margin-bottom: 15px;
            }
            .day {
              margin: 20px 0;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 12px;
              page-break-inside: avoid;
            }
            .day-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 1px solid #e0e0e0;
            }
            .day-number {
              background: #7C3AED;
              color: white;
              padding: 5px 15px;
              border-radius: 20px;
              font-weight: bold;
            }
            .day-theme { color: #666; font-style: italic; }
            .activity {
              margin: 15px 0;
              padding: 15px;
              background: white;
              border-left: 4px solid ${isBusiness ? '#2563eb' : '#7C3AED'};
              border-radius: 0 8px 8px 0;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .activity-time {
              color: #7C3AED;
              font-weight: 600;
              font-size: 14px;
            }
            .activity-title {
              font-size: 16px;
              font-weight: 600;
              margin: 5px 0;
            }
            .activity-desc { color: #555; font-size: 14px; }
            .activity-location {
              color: #888;
              font-size: 13px;
              margin-top: 8px;
            }
            .meeting-badge {
              display: inline-block;
              background: #2563eb;
              color: white;
              padding: 2px 10px;
              border-radius: 12px;
              font-size: 11px;
              margin-left: 10px;
            }
            .meal {
              margin: 10px 0;
              padding: 12px;
              background: #fff9e6;
              border-radius: 8px;
            }
            .meal-type {
              font-weight: 600;
              color: #7C3AED;
            }
            .tips {
              background: #e8f4ea;
              padding: 20px;
              border-radius: 12px;
              margin: 20px 0;
            }
            .tips h3 { color: #2e7d32; margin-bottom: 10px; }
            .tips ul { margin-left: 20px; }
            .tips li { margin: 8px 0; color: #333; }
            .booking-section {
              background: #f0f4ff;
              padding: 20px;
              border-radius: 12px;
              margin: 20px 0;
            }
            .booking-category {
              margin: 15px 0;
            }
            .booking-category h4 {
              color: #1e40af;
              margin-bottom: 8px;
            }
            .booking-link {
              color: #2563eb;
              text-decoration: none;
              display: block;
              padding: 5px 0;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              color: #888;
              font-size: 12px;
            }
            .footer .logo {
              font-size: 16px;
              color: #7C3AED;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .weather-info {
              background: #e3f2fd;
              padding: 15px;
              border-radius: 10px;
              margin: 15px 0;
              text-align: center;
            }
            @media print {
              body { padding: 20px; }
              .day { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✈️ ${itinerary?.destination}</h1>
            <p class="subtitle">${isBusiness ? '🏢 Business Trip Itinerary' : '🌴 Travel Itinerary'}</p>
            <div class="dates">📅 ${itinerary?.start_date} → ${itinerary?.end_date}</div>
          </div>

          ${itinerary?.weather ? `
            <div class="weather-info">
              <strong>Expected Weather:</strong> ${itinerary.weather.condition} | 
              🌡️ ${Math.round(itinerary.weather.temp_c)}°C / ${Math.round((itinerary.weather.temp_c * 9/5) + 32)}°F | 
              💧 ${itinerary.weather.humidity}% humidity
            </div>
          ` : ''}

          ${itinerary?.ai_explanation ? `
            <div class="section">
              <p style="font-style: italic; color: #666; padding: 15px; background: #f9f9f9; border-radius: 8px;">
                "${itinerary.ai_explanation}"
              </p>
            </div>
          ` : ''}

          ${(itinerary?.itinerary || itinerary?.days || []).map((day, idx) => `
            <div class="day">
              <div class="day-header">
                <span class="day-number">Day ${day.day || idx + 1}</span>
                <span class="day-theme">${day.theme || day.title || ''}</span>
              </div>
              
              ${(day.activities || []).map(act => `
                <div class="activity">
                  <div class="activity-time">
                    🕐 ${act.time || act.start_time || ''} ${act.duration ? `(${act.duration})` : ''}
                    ${(act.category === 'meeting' || act.type === 'meeting') ? '<span class="meeting-badge">📊 Meeting</span>' : ''}
                  </div>
                  <div class="activity-title">${act.title || act.name || ''}</div>
                  <div class="activity-desc">${act.description || ''}</div>
                  ${act.location ? `<div class="activity-location">📍 ${act.location}</div>` : ''}
                  ${act.why_recommended ? `<div style="color: #7C3AED; font-size: 13px; margin-top: 5px;">💡 ${act.why_recommended}</div>` : ''}
                </div>
              `).join('')}

              ${(day.meals || []).map(meal => `
                <div class="meal">
                  <span class="meal-type">${meal.type || 'Meal'}:</span>
                  ${meal.restaurant || meal.name || ''} 
                  ${meal.cuisine ? `• ${meal.cuisine}` : ''} 
                  ${meal.price_range ? `• ${meal.price_range}` : ''}
                  ${meal.must_try ? `<br>🍽️ <em>Must try: ${meal.must_try}</em>` : ''}
                </div>
              `).join('')}
            </div>
          `).join('')}

          ${itinerary?.tips?.length || itinerary?.important_tips?.length ? `
            <div class="tips">
              <h3>💡 Travel Tips</h3>
              <ul>
                ${(itinerary?.tips || itinerary?.important_tips || []).map(tip => `<li>${tip}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${itinerary?.packing_suggestions?.length ? `
            <div class="section">
              <h3 class="section-title">🧳 Packing Suggestions</h3>
              <ul style="margin-left: 20px;">
                ${itinerary.packing_suggestions.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${itinerary?.booking_links ? `
            <div class="booking-section">
              <h3 class="section-title">🔗 Booking Links</h3>
              ${Object.entries(itinerary.booking_links).map(([category, links]) => `
                <div class="booking-category">
                  <h4>${category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                  ${(links || []).map(link => `
                    <a href="${link.url}" class="booking-link" target="_blank">
                      → ${link.name}${link.note ? ` - ${link.note}` : ''}
                    </a>
                  `).join('')}
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="footer">
            <div class="logo">✨ Bleez</div>
            <p>Your Intelligent Travel Companion</p>
            <p style="margin-top: 10px; font-size: 11px;">
              Generated on ${new Date().toLocaleDateString()}
            </p>
          </div>
        </body>
      </html>
    `;
  };

  const goToBookingCompare = () => {
    navigate('/booking-compare', { 
      state: { 
        bookingLinks: itinerary?.booking_links,
        destination: itinerary?.destination
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="itinerary-loading">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!itinerary) return null;

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col overflow-x-hidden" data-testid="itinerary-page">
      <Navbar />
      
      {/* Printable content wrapper for PDF generation */}
      <main ref={printableRef} className="flex-1 pt-16 sm:pt-24 pb-24 sm:pb-12 bg-background">
        {/* Hero Section with Real Destination Image */}
        <section className="relative h-[35vh] sm:h-[40vh] min-h-[250px] sm:min-h-[300px] overflow-hidden print:h-[200px] print:min-h-[200px]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${itinerary.destination_image || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80'})` 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          
          <div className="container-main relative h-full flex flex-col justify-end pb-4 sm:pb-8">
            {/* Weather Badge - Shows both C and F */}
            {itinerary.weather_forecast && itinerary.weather_forecast[0] && (
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 sm:p-3 rounded-lg sm:rounded-xl glass border border-white/20 flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                <div className="flex items-center gap-1 sm:gap-2">
                  {itinerary.weather_forecast[0].condition?.toLowerCase().includes('rain') ? (
                    <CloudRain className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  ) : itinerary.weather_forecast[0].condition?.toLowerCase().includes('cloud') ? (
                    <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                  ) : (
                    <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                  )}
                  <div>
                    <p className="text-base sm:text-lg font-bold">
                      {formatTemp(itinerary.weather_forecast[0].max_temp_c)}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">{itinerary.weather_forecast[0].condition}</p>
                  </div>
                </div>
                <div className="border-l border-white/20 pl-2 sm:pl-3 text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                  <p className="flex items-center gap-1"><Droplets className="w-3 h-3" /> {itinerary.weather_forecast[0].humidity}%</p>
                  <p className="flex items-center gap-1"><CloudRain className="w-3 h-3" /> {itinerary.weather_forecast[0].chance_of_rain}%</p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm mb-2 sm:mb-4">
              <span className="px-2 sm:px-3 py-1 rounded-full bg-primary/20 text-primary capitalize flex items-center gap-1">
                {itinerary.is_business_trip && <Briefcase className="w-3 h-3" />}
                {itinerary.trip_type} Trip
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="truncate max-w-[150px] sm:max-w-none">{itinerary.start_date} - {itinerary.end_date}</span>
              </span>
            </div>

            {/* Business Trip Meeting Intelligence Banner - Compact on mobile */}
            {itinerary.is_business_trip && itinerary.meeting_info && (
              <div className="mb-3 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-blue-500/10 border border-blue-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-blue-200 text-sm sm:text-base truncate">{itinerary.meeting_info.meeting_venue?.name || itinerary.meeting_info.agenda}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        📍 {itinerary.meeting_info.meeting_venue?.address || 'Venue TBD'} • 🕐 {itinerary.meeting_info.meeting_time || 'Time TBD'}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedMeeting({
                      venue: itinerary.meeting_info.meeting_venue?.address || itinerary.meeting_info.agenda,
                      meetingTime: `${itinerary.meeting_info.meeting_date}T${itinerary.meeting_info.meeting_time}:00`,
                      meetingTitle: itinerary.meeting_info.agenda || 'Business Meeting',
                      clientName: ''
                    })}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full sm:w-auto text-sm"
                    data-testid="meeting-intel-banner-btn"
                  >
                    <Navigation className="w-4 h-4" />
                    <span className="sm:inline">Live Travel Info</span>
                  </Button>
                </div>
              </div>
            )}

            <h1 className="text-2xl sm:text-4xl md:text-6xl font-serif tracking-tight mb-2 sm:mb-4">
              {itinerary.destination}
            </h1>
            
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="btn-secondary gap-2 text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-2" data-testid="btn-share">
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass border-white/10 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-xl">Share Itinerary</DialogTitle>
                    <p className="text-sm text-muted-foreground">Share your {itinerary?.destination} trip with friends and family</p>
                  </DialogHeader>
                  
                  {/* Native Share (Mobile) */}
                  {typeof navigator !== 'undefined' && navigator.share && (
                    <Button 
                      onClick={shareNative}
                      className="w-full bg-primary hover:bg-primary/90 gap-2 mb-4"
                    >
                      <Share2 className="w-5 h-5" />
                      Share via Device
                    </Button>
                  )}
                  
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {/* WhatsApp */}
                    <Button 
                      onClick={shareToWhatsApp}
                      variant="outline"
                      className="flex flex-col items-center gap-2 h-auto py-4 bg-white/5 border-white/10 hover:bg-green-500/20 hover:border-green-500/50"
                    >
                      <svg viewBox="0 0 24 24" className="w-6 h-6 text-green-500" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span className="text-xs">WhatsApp</span>
                    </Button>
                    
                    {/* Facebook */}
                    <Button 
                      onClick={shareToFacebook}
                      variant="outline"
                      className="flex flex-col items-center gap-2 h-auto py-4 bg-white/5 border-white/10 hover:bg-blue-500/20 hover:border-blue-500/50"
                    >
                      <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-500" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span className="text-xs">Facebook</span>
                    </Button>
                    
                    {/* Twitter/X */}
                    <Button 
                      onClick={shareToTwitter}
                      variant="outline"
                      className="flex flex-col items-center gap-2 h-auto py-4 bg-white/5 border-white/10 hover:bg-gray-500/20 hover:border-gray-500/50"
                    >
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span className="text-xs">X (Twitter)</span>
                    </Button>
                    
                    {/* LinkedIn */}
                    <Button 
                      onClick={shareToLinkedIn}
                      variant="outline"
                      className="flex flex-col items-center gap-2 h-auto py-4 bg-white/5 border-white/10 hover:bg-blue-600/20 hover:border-blue-600/50"
                    >
                      <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-600" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <span className="text-xs">LinkedIn</span>
                    </Button>
                    
                    {/* Telegram */}
                    <Button 
                      onClick={shareToTelegram}
                      variant="outline"
                      className="flex flex-col items-center gap-2 h-auto py-4 bg-white/5 border-white/10 hover:bg-sky-500/20 hover:border-sky-500/50"
                    >
                      <svg viewBox="0 0 24 24" className="w-6 h-6 text-sky-500" fill="currentColor">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                      <span className="text-xs">Telegram</span>
                    </Button>
                    
                    {/* Email */}
                    <Button 
                      onClick={shareByEmail}
                      variant="outline"
                      className="flex flex-col items-center gap-2 h-auto py-4 bg-white/5 border-white/10 hover:bg-red-500/20 hover:border-red-500/50"
                    >
                      <Mail className="w-6 h-6 text-red-500" />
                      <span className="text-xs">Email</span>
                    </Button>
                  </div>
                  
                  {/* Copy Link */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <Button 
                      onClick={copyLink}
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 h-12 bg-white/5 border-white/10"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                      <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
                    </Button>
                  </div>
                  
                  {/* Download PDF option */}
                  <div className="mt-2">
                    <Button 
                      onClick={() => { downloadPDF(); setShareOpen(false); }}
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 h-12 bg-primary/10 border-primary/30 hover:bg-primary/20"
                      disabled={generatingPdf}
                    >
                      {generatingPdf ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Generating PDF...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          <span>Download Visual PDF</span>
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* Add to Calendar option */}
                  <div className="mt-2">
                    <Button 
                      onClick={() => { downloadCalendar(); setShareOpen(false); }}
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 h-12 bg-green-500/10 border-green-500/30 hover:bg-green-500/20 text-green-400"
                      data-testid="btn-add-to-calendar-share"
                    >
                      <CalendarPlus className="w-5 h-5" />
                      <span>Add to Calendar (.ics)</span>
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="outline" 
                className="btn-secondary gap-2" 
                onClick={downloadPDF} 
                disabled={generatingPdf}
                data-testid="btn-download"
              >
                {generatingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download PDF
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                className="btn-secondary gap-2 border-green-500/30 hover:bg-green-500/10 text-green-400" 
                onClick={downloadCalendar}
                data-testid="btn-add-to-calendar"
              >
                <CalendarPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Add to Calendar</span>
                <span className="sm:hidden">Calendar</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="btn-secondary gap-2 border-purple-500/30 hover:bg-purple-500/10 text-purple-400" 
                onClick={viewTripPhotos}
                data-testid="btn-trip-photos"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Trip Photos</span>
                <span className="sm:hidden">Photos</span>
              </Button>
              
              <Button className="btn-primary gap-2" onClick={goToBookingCompare} data-testid="btn-book-now">
                <DollarSign className="w-4 h-4" />
                Compare & Book
              </Button>
            </div>
          </div>
        </section>

        <div className="container-main py-12">
          {/* AI Explanation */}
          {itinerary.ai_explanation && (
            <div className="mb-12 p-6 rounded-2xl glass border border-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-background" />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Why This Itinerary?</h3>
                  <p className="text-muted-foreground">{itinerary.ai_explanation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Profile Adaptations */}
          {itinerary.profile_adaptations && itinerary.profile_adaptations.length > 0 && (
            <div className="mb-8 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Personalized for You
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {itinerary.profile_adaptations.map((adaptation, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {adaptation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Main Content - Timeline */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="itinerary" className="w-full">
                <TabsList className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl p-1 mb-4 sm:mb-8">
                  <TabsTrigger value="itinerary" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm sm:text-base">
                    Day-by-Day
                  </TabsTrigger>
                  <TabsTrigger value="bookings" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm sm:text-base">
                    Book Now
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="itinerary" className="space-y-0">
                  {/* Day Selector with Weather - Horizontally scrollable on mobile */}
                  <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide mb-4 sm:mb-8">
                    <div className="flex gap-2 sm:gap-3 pb-2 sm:pb-4 min-w-max">
                      {itinerary.days?.map((day, idx) => {
                        const dayWeather = itinerary.weather_forecast?.[idx];
                        return (
                          <button
                            key={idx}
                            onClick={() => setActiveDay(idx)}
                            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl shrink-0 transition-all min-w-[100px] sm:min-w-[140px] ${
                              activeDay === idx 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-white/5 border border-white/10 hover:bg-white/10'
                            }`}
                            data-testid={`day-btn-${idx}`}
                          >
                            <div className="flex items-center justify-between gap-2 sm:gap-3">
                              <div className="text-left">
                                <p className="text-[10px] sm:text-xs opacity-70">Day {day.day}</p>
                                <p className="font-medium text-xs sm:text-sm truncate max-w-[60px] sm:max-w-none">{day.theme || `Day ${day.day}`}</p>
                              </div>
                              {dayWeather && (
                                <div className="text-right">
                                  <p className="text-xs sm:text-sm font-bold">{formatTempCompact(dayWeather.max_temp_c)}</p>
                                  <p className="text-[10px] sm:text-xs opacity-70">{dayWeather.chance_of_rain}%💧</p>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Day Weather Summary - Compact on mobile */}
                  {itinerary.weather_forecast?.[activeDay] && (
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500/10 to-yellow-500/10 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-4">
                          {itinerary.weather_forecast[activeDay].condition?.toLowerCase().includes('rain') ? (
                            <CloudRain className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
                          ) : itinerary.weather_forecast[activeDay].condition?.toLowerCase().includes('cloud') ? (
                            <Cloud className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                          ) : (
                            <Sun className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />
                          )}
                          <div>
                            <p className="font-medium text-sm sm:text-base">{itinerary.weather_forecast[activeDay].condition}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {formatTempRange(itinerary.weather_forecast[activeDay].min_temp_c, itinerary.weather_forecast[activeDay].max_temp_c)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3 sm:gap-6 text-xs sm:text-sm">
                          <div className="text-center hidden sm:block">
                            <Droplets className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                            <p className="text-muted-foreground">{itinerary.weather_forecast[activeDay].humidity}%</p>
                          </div>
                          <div className="text-center">
                            <CloudRain className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                            <p className="text-muted-foreground">{itinerary.weather_forecast[activeDay].chance_of_rain}%</p>
                          </div>
                          <div className="text-center hidden sm:block">
                            <Sun className="w-4 h-4 mx-auto text-yellow-400 mb-1" />
                            <p className="text-muted-foreground">UV {itinerary.weather_forecast[activeDay].uv_index || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  {itinerary.days?.[activeDay] && (
                    <div className="relative">
                      <div className="timeline-line hidden sm:block" />
                      
                      <div className="space-y-4 sm:space-y-8">
                        {itinerary.days[activeDay].activities?.map((activity, idx) => {
                          const Icon = getCategoryIcon(activity.category);
                          const placeDetails = activity.place_details;
                          const hasImage = placeDetails?.photos?.length > 0;
                          const isMeeting = activity.category === 'business' || activity.category === 'meeting' || activity.type === 'meeting';
                          
                          return (
                            <div key={idx} className="relative pl-0 sm:pl-12" data-testid={`activity-${idx}`}>
                              <div className="absolute left-0 top-0 timeline-dot hidden sm:block" />
                              
                              <div className={`rounded-xl sm:rounded-2xl bg-white/5 border ${isMeeting ? 'border-blue-500/30' : 'border-white/10'} hover:border-white/20 transition-colors overflow-hidden`}>
                                {/* Meeting Header with Professional Visual */}
                                {isMeeting ? (
                                  <BusinessMeetingVisual 
                                    variant="card" 
                                    index={idx}
                                    className="h-32 sm:h-48"
                                  >
                                    <div className="text-white">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 bg-blue-500 rounded text-[10px] sm:text-xs font-medium">BUSINESS MEETING</span>
                                      </div>
                                      <h4 className="text-sm sm:text-lg font-bold truncate">{activity.place_name || activity.title}</h4>
                                      <p className="text-xs sm:text-sm opacity-80">{activity.time}</p>
                                    </div>
                                  </BusinessMeetingVisual>
                                ) : (
                                  /* Regular Activity Image */
                                  hasImage && (
                                    <div className="relative h-32 sm:h-48 overflow-hidden">
                                      <img 
                                        src={placeDetails.photos[0]} 
                                        alt={activity.place_name || activity.title}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                                      {placeDetails.rating && (
                                        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm flex items-center gap-1">
                                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                          <span className="text-xs sm:text-sm font-medium">{placeDetails.rating}</span>
                                          {placeDetails.reviews_count && (
                                            <span className="text-[10px] sm:text-xs text-muted-foreground">({placeDetails.reviews_count})</span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )
                                )}
                                
                                <div className="p-4 sm:p-6">
                                  <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${isMeeting ? 'bg-blue-500/20' : 'bg-primary/10'} flex items-center justify-center shrink-0`}>
                                        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isMeeting ? 'text-blue-400' : 'text-primary'}`} />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-[10px] sm:text-xs text-muted-foreground">{activity.time}</p>
                                        <h4 className="font-medium text-sm sm:text-base truncate">{activity.place_name || activity.title}</h4>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                      {activity.entry_fee && (
                                        <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-green-500/20 text-green-400">
                                          {activity.entry_fee}
                                        </span>
                                      )}
                                      {activity.duration && (
                                        <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          <span className="hidden sm:inline">{activity.duration}</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-none">
                                    {activity.description}
                                  </p>
                                  
                                  {/* Location with Google Maps link */}
                                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground mb-3 sm:mb-4">
                                    {(placeDetails?.address || activity.location) && (
                                      <a 
                                        href={placeDetails?.maps_url || `https://maps.google.com/?q=${encodeURIComponent(activity.location || placeDetails?.address)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 hover:text-primary transition-colors"
                                      >
                                        <MapPin className="w-3 h-3" />
                                        {placeDetails?.address || activity.location}
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                    {activity.cost_estimate && (
                                      <span className="flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" />
                                        {activity.cost_estimate}
                                      </span>
                                    )}
                                  </div>

                                  {/* Opening hours */}
                                  {placeDetails?.opening_hours?.length > 0 && (
                                    <div className="mb-4 text-xs text-muted-foreground">
                                      <p className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {placeDetails.opening_hours[new Date().getDay()] || 'Hours vary'}
                                      </p>
                                    </div>
                                  )}

                                  {activity.why_recommended && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                      <p className="text-xs text-primary">
                                        <Sparkles className="w-3 h-3 inline mr-1" />
                                        Why: {activity.why_recommended}
                                      </p>
                                    </div>
                                  )}

                                  {activity.tips && (
                                    <div className="mt-2">
                                      <p className="text-xs text-muted-foreground">
                                        💡 Tip: {activity.tips}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Meeting Intelligence Button - For business meetings */}
                                  {isMeeting && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                      <Button
                                        onClick={() => setSelectedMeeting({
                                          venue: placeDetails?.address || activity.location || activity.place_name,
                                          meetingTime: activity.meeting_time || activity.time,
                                          meetingTitle: activity.place_name || activity.title,
                                          clientName: activity.client_name || '',
                                          activityData: activity
                                        })}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                        data-testid={`meeting-intel-btn-${idx}`}
                                      >
                                        <Navigation className="w-4 h-4" />
                                        Live Travel Time & Alerts
                                      </Button>
                                    </div>
                                  )}
                                  
                                  {/* Get Directions Button */}
                                  {placeDetails?.directions_url && !isMeeting && (
                                    <div className="mt-4">
                                      <a
                                        href={placeDetails.directions_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm transition-colors"
                                      >
                                        <Map className="w-4 h-4" />
                                        Get Directions
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Meals */}
                        {itinerary.days[activeDay].meals?.map((meal, idx) => (
                          <div key={`meal-${idx}`} className="relative pl-12" data-testid={`meal-${idx}`}>
                            <div className="absolute left-0 top-0 timeline-dot" />
                            
                            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
                              <div className="flex items-center gap-3 mb-3">
                                <Utensils className="w-5 h-5 text-primary" />
                                <div>
                                  <p className="text-xs text-muted-foreground">{meal.time}</p>
                                  <h4 className="font-medium capitalize">{meal.type}</h4>
                                </div>
                              </div>
                              <p className="font-medium">{meal.restaurant}</p>
                              <p className="text-sm text-muted-foreground">{meal.cuisine} • {meal.price_range}</p>
                              {meal.must_try && (
                                <p className="text-xs text-primary mt-2">
                                  <Star className="w-3 h-3 inline mr-1" />
                                  Must try: {meal.must_try}
                                </p>
                              )}
                              {meal.dietary_compliance && (
                                <p className="text-xs text-green-500 mt-1">
                                  ✓ {meal.dietary_compliance}
                                </p>
                              )}
                              {meal.allergen_warning && (
                                <p className="text-xs text-orange-500 mt-1">
                                  ⚠️ {meal.allergen_warning}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="bookings" className="space-y-8">
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 mb-6">
                    <p className="text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>Want detailed price comparisons? </span>
                      <Button variant="link" className="text-primary p-0 h-auto" onClick={goToBookingCompare}>
                        View Compare Page →
                      </Button>
                    </p>
                  </div>
                  
                  {bookingCategories.map(category => (
                    <div key={category.key} className="space-y-4">
                      <h3 className="flex items-center gap-2 font-medium text-lg">
                        <category.icon className="w-5 h-5 text-primary" />
                        {category.label}
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {itinerary.booking_links?.[category.key]?.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 rounded-xl bg-white/5 
                                     border border-white/10 hover:border-primary/50 transition-colors group"
                            data-testid={`booking-${category.key}-${idx}`}
                          >
                            <div>
                              <span className="font-medium">{link.name}</span>
                              {link.why_recommended && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                  {link.why_recommended}
                                </p>
                              )}
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block space-y-6">
              {/* Budget Breakdown */}
              {itinerary.budget_breakdown && Object.keys(itinerary.budget_breakdown).length > 0 && (
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Budget Estimate
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(itinerary.budget_breakdown).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{key}</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {itinerary.tips && itinerary.tips.length > 0 && (
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Travel Tips
                  </h3>
                  <ul className="space-y-3">
                    {itinerary.tips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Budget & Tips Section - Integrated below main content */}
          <div className="lg:hidden mt-8 space-y-6">
            {/* Budget Breakdown - Mobile */}
            {itinerary.budget_breakdown && Object.keys(itinerary.budget_breakdown).length > 0 && (
              <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
                <h3 className="font-medium mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Budget Estimate
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(itinerary.budget_breakdown).map(([key, value]) => (
                    <div key={key} className="p-3 rounded-lg bg-white/5">
                      <span className="text-xs text-muted-foreground capitalize block mb-1">{key}</span>
                      <span className="font-medium text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips - Mobile (Collapsible) */}
            {itinerary.tips && itinerary.tips.length > 0 && (
              <details className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
                <summary className="font-medium flex items-center gap-2 text-sm sm:text-base cursor-pointer list-none">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Travel Tips
                  <ChevronRight className="w-4 h-4 ml-auto transition-transform [details[open]>&]:rotate-90" />
                </summary>
                <ul className="space-y-3 mt-4">
                  {itinerary.tips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </div>
      </main>
      
      {/* Meeting Intelligence Dialog */}
      <Dialog open={!!selectedMeeting} onOpenChange={(open) => !open && setSelectedMeeting(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-500" />
              Meeting Intelligence
            </DialogTitle>
          </DialogHeader>
          {selectedMeeting && (
            <MeetingIntelligence
              venue={selectedMeeting.venue}
              meetingTime={selectedMeeting.meetingTime}
              meetingTitle={selectedMeeting.meetingTitle}
              clientName={selectedMeeting.clientName}
              onClose={() => setSelectedMeeting(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default ItineraryPage;
