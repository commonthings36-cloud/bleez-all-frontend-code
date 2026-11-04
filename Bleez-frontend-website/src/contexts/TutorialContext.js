import React, { createContext, useContext, useState, useEffect } from 'react';

const TutorialContext = createContext(null);

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
};

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Bleez! 🌍',
    description: 'Your AI-powered travel companion. Let me show you around!',
    target: null,
    page: '/',
    position: 'center'
  },
  {
    id: 'install-app',
    title: 'Install the App 📱',
    description: 'Bleez works as a native app on Android & iOS! Look for the "Install" or "Add to Home Screen" option in your browser menu.',
    target: null,
    page: '/',
    position: 'center',
    showInstallTip: true
  },
  {
    id: 'plan-trip',
    title: 'Plan Your Trip ✈️',
    description: 'Click "Plan Your Journey" to create AI-powered personalized itineraries based on your preferences.',
    target: '[data-testid="hero-plan-btn"]',
    page: '/',
    position: 'bottom'
  },
  {
    id: 'trip-planner',
    title: 'AI Trip Planner 🤖',
    description: 'Enter your destination, dates, and preferences. Our AI will create a detailed day-by-day itinerary with real places, photos, and booking links!',
    target: '[data-testid="destination-input"]',
    page: '/plan',
    position: 'right'
  },
  {
    id: 'voice-assistant',
    title: 'AI Voice Assistant 🎤',
    description: 'Click the chat bubble to talk with your AI travel assistant. You can type or use voice - just tap the microphone!',
    target: '[data-testid="chat-toggle"]',
    page: '/plan',
    position: 'left'
  },
  {
    id: 'voice-settings',
    title: 'Voice Settings ⚙️',
    description: 'Choose from 6 different voices for your AI assistant. Enable or disable voice responses with the speaker icon.',
    target: '[data-testid="chat-window"]',
    page: '/plan',
    position: 'left',
    requiresChatOpen: true
  },
  {
    id: 'my-trips',
    title: 'My Trips 🗺️',
    description: 'All your planned trips are saved here. View, edit, or share any itinerary.',
    target: 'nav a[href="/my-trips"]',
    page: '/my-trips',
    position: 'bottom'
  },
  {
    id: 'itinerary-view',
    title: 'Detailed Itinerary 📋',
    description: 'Each trip shows day-by-day activities with real photos, ratings, directions, and booking options.',
    target: null,
    page: '/my-trips',
    position: 'center'
  },
  {
    id: 'social-sharing',
    title: 'Share on Social Media 📤',
    description: 'Share your itinerary on WhatsApp, Facebook, Twitter, LinkedIn, Telegram, or via Email!',
    target: '[data-testid="btn-share"]',
    page: 'itinerary',
    position: 'bottom'
  },
  {
    id: 'meeting-intelligence',
    title: 'Meeting Intelligence 💼',
    description: 'For business trips, get live travel time to meetings, departure alerts, and smart notifications.',
    target: null,
    page: 'itinerary',
    position: 'center'
  },
  {
    id: 'booking-compare',
    title: 'Compare & Book 💰',
    description: 'Compare prices for flights, hotels, restaurants, and transport. Find the best deals from multiple providers!',
    target: '[data-testid="compare-book-btn"]',
    page: 'itinerary',
    position: 'bottom'
  },
  {
    id: 'albums',
    title: 'Travel Albums 📸',
    description: 'Create albums to organize your travel memories. Add photos, notes, and share with friends!',
    target: 'nav a[href="/albums"]',
    page: '/albums',
    position: 'bottom'
  },
  {
    id: 'community',
    title: 'Community Chat 💬',
    description: 'Connect with other travelers! Share tips, ask questions, and make travel friends.',
    target: 'nav a[href="/community"]',
    page: '/community',
    position: 'bottom'
  },
  {
    id: 'alerts',
    title: 'Real-time Alerts 🔔',
    description: 'Get notified about weather changes, traffic updates, and local events for your trips.',
    target: '[data-testid="alerts-bell"]',
    page: '/',
    position: 'bottom'
  },
  {
    id: 'profile',
    title: 'Your Profile 👤',
    description: 'Set your food preferences, budget, interests, and travel style. The AI uses this to personalize your trips!',
    target: 'nav a[href="/profile"]',
    page: '/profile',
    position: 'bottom'
  },
  {
    id: 'smart-insights',
    title: 'AI Insights 🧠',
    description: 'The app learns from your trips to provide personalized recommendations and identify your traveler archetype.',
    target: null,
    page: '/profile',
    position: 'center'
  },
  {
    id: 'offline-mode',
    title: 'Offline Mode 📴',
    description: 'Your saved itineraries work offline! Perfect for when you\'re traveling without internet.',
    target: null,
    page: '/',
    position: 'center'
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🎉',
    description: 'You now know all the features of Bleez. Start planning your dream trip today!',
    target: null,
    page: '/',
    position: 'center',
    isFinal: true
  }
];

export const TutorialProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(
    localStorage.getItem('tutorialCompleted') === 'true'
  );

  const steps = TUTORIAL_STEPS;
  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const startTutorial = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipTutorial = () => {
    setIsActive(false);
    localStorage.setItem('tutorialCompleted', 'true');
    setHasSeenTutorial(true);
  };

  const completeTutorial = () => {
    setIsActive(false);
    localStorage.setItem('tutorialCompleted', 'true');
    setHasSeenTutorial(true);
  };

  const resetTutorial = () => {
    localStorage.removeItem('tutorialCompleted');
    setHasSeenTutorial(false);
    setCurrentStep(0);
  };

  return (
    <TutorialContext.Provider value={{
      isActive,
      currentStep,
      step,
      steps,
      progress,
      hasSeenTutorial,
      startTutorial,
      nextStep,
      prevStep,
      skipTutorial,
      completeTutorial,
      resetTutorial
    }}>
      {children}
    </TutorialContext.Provider>
  );
};
