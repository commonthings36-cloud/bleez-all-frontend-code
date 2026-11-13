import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { IMG } from '../data/travelImages';
import { Navbar, Footer } from '../components/Layout';
import { Button } from '../components/ui/button';
import { 
  Play, Pause, ChevronLeft, ChevronRight, SkipForward,
  Plane, Mic, Share2, MapPin, Calendar, Sparkles,
  Hotel, Car, Users, Bell, User, Folder, Globe,
  Smartphone, Download, Volume2, Brain, Wifi, WifiOff,
  CheckCircle, ArrowRight
} from 'lucide-react';

const TutorialPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const STEP_DURATION = 6000; // 6 seconds per step

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Bleez',
      subtitle: 'Your AI-Powered Travel Companion',
      description: 'Plan personalized trips, get real-time alerts, compare prices, and explore the world smarter with AI assistance.',
      icon: Globe,
      color: 'from-amber-500 to-orange-500',
      features: ['AI Trip Planning', 'Voice Assistant', 'Real-time Alerts', 'Price Comparison'],
      animation: 'animate-float'
    },
    {
      id: 'install',
      title: 'Install on Your Device',
      subtitle: 'Works on Android & iOS',
      description: 'Bleez works as a native app! Install it for quick access and offline support.',
      icon: Smartphone,
      color: 'from-green-500 to-emerald-500',
      features: [],
      instructions: [
        { platform: 'Android Chrome', steps: 'Tap ⋮ menu → "Add to Home Screen"' },
        { platform: 'iOS Safari', steps: 'Tap Share ↑ → "Add to Home Screen"' },
        { platform: 'Desktop', steps: 'Click install icon in address bar' }
      ],
      animation: 'animate-bounce-slow'
    },
    {
      id: 'plan',
      title: 'AI Trip Planning',
      subtitle: 'Personalized Itineraries in Seconds',
      description: 'Enter your destination and preferences. Our AI creates detailed day-by-day itineraries with real places, photos, ratings, and booking links.',
      icon: Plane,
      color: 'from-blue-500 to-cyan-500',
      features: ['Smart destination suggestions', 'Day-by-day activities', 'Real photos & ratings', 'Booking links included'],
      demoAction: () => navigate('/plan'),
      animation: 'animate-fly'
    },
    {
      id: 'voice',
      title: 'AI Voice Assistant',
      subtitle: 'Talk to Your Travel Companion',
      description: 'Speak naturally to get travel advice, plan trips, or ask questions. Choose from 6 different voice personalities!',
      icon: Mic,
      color: 'from-purple-500 to-pink-500',
      features: ['Speech-to-text (Whisper)', 'Natural voice responses', '6 voice options', 'Hands-free travel help'],
      voices: ['Nova', 'Alloy', 'Coral', 'Echo', 'Onyx', 'Shimmer'],
      animation: 'animate-pulse-scale'
    },
    {
      id: 'itinerary',
      title: 'Detailed Itineraries',
      subtitle: 'Everything You Need to Know',
      description: 'View your trips with real photos, Google ratings, opening hours, directions, and personalized recommendations.',
      icon: Calendar,
      color: 'from-indigo-500 to-violet-500',
      features: ['Real place photos', 'Ratings & reviews', 'Opening hours', 'One-click directions'],
      animation: 'animate-slide-up'
    },
    {
      id: 'share',
      title: 'Social Sharing',
      subtitle: 'Share Your Adventures',
      description: 'Share your itineraries on WhatsApp, Facebook, Twitter, LinkedIn, Telegram, or via Email with one click!',
      icon: Share2,
      color: 'from-pink-500 to-rose-500',
      features: ['WhatsApp', 'Facebook', 'Twitter/X', 'LinkedIn', 'Telegram', 'Email'],
      animation: 'animate-spread'
    },
    {
      id: 'booking',
      title: 'Compare & Book',
      subtitle: 'Find the Best Deals',
      description: 'Compare prices for flights, hotels, restaurants, and transport from multiple providers. Find the best deals instantly!',
      icon: Hotel,
      color: 'from-teal-500 to-green-500',
      features: ['Flight comparison', 'Hotel prices', 'Restaurant options', 'Transport & rides'],
      animation: 'animate-bounce-slow'
    },
    {
      id: 'transport',
      title: 'Smart Transport',
      subtitle: 'Location-Aware Ride Services',
      description: 'Get ride-hailing options specific to your destination - Uber, Lyft, Ola, Bolt, and more with auto-detected pickup!',
      icon: Car,
      color: 'from-sky-500 to-blue-500',
      features: ['Uber, Lyft, Ola', 'Location-specific services', 'Auto-detect pickup', 'Public transit options'],
      animation: 'animate-drive'
    },
    {
      id: 'meeting',
      title: 'Meeting Intelligence',
      subtitle: 'For Business Travelers',
      description: 'Get live travel time to meetings, smart departure alerts, and delay notifications. Never be late again!',
      icon: Brain,
      color: 'from-orange-500 to-red-500',
      features: ['Live travel time', 'Departure alerts', 'Traffic updates', 'Delay notifications'],
      animation: 'animate-pulse-scale'
    },
    {
      id: 'alerts',
      title: 'Real-time Alerts',
      subtitle: 'Stay Informed',
      description: 'Get notified about weather changes, traffic updates, local events, and important travel information.',
      icon: Bell,
      color: 'from-yellow-500 to-amber-500',
      features: ['Weather alerts', 'Traffic updates', 'Local events', 'Travel advisories'],
      animation: 'animate-ring'
    },
    {
      id: 'albums',
      title: 'Travel Albums',
      subtitle: 'Organize Your Memories',
      description: 'Create albums to organize photos and notes from your trips. Share memories with friends and family!',
      icon: Folder,
      color: 'from-fuchsia-500 to-purple-500',
      features: ['Photo collections', 'Trip notes', 'Share with friends', 'Private or public'],
      demoAction: () => navigate('/albums'),
      animation: 'animate-float'
    },
    {
      id: 'profile',
      title: 'Smart Profile',
      subtitle: 'Personalized Experience',
      description: 'Set your preferences - food, budget, interests, travel style. The AI learns and personalizes everything for you!',
      icon: User,
      color: 'from-violet-500 to-indigo-500',
      features: ['Food preferences', 'Budget settings', 'Travel interests', 'AI learns from you'],
      demoAction: () => navigate('/profile'),
      animation: 'animate-pulse-scale'
    },
    {
      id: 'offline',
      title: 'Offline Mode',
      subtitle: 'Travel Without Internet',
      description: 'Your saved itineraries work offline! Perfect for when you\'re traveling without internet connection.',
      icon: WifiOff,
      color: 'from-slate-500 to-gray-600',
      features: ['Saved itineraries offline', 'No internet needed', 'Auto-sync when online', 'PWA technology'],
      animation: 'animate-float'
    },
    {
      id: 'complete',
      title: 'You\'re Ready!',
      subtitle: 'Start Your Adventure',
      description: 'You now know all the amazing features of Bleez. Start planning your dream trip today!',
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      features: [],
      isFinal: true,
      animation: 'animate-celebrate'
    }
  ];

  // Auto-play logic with progress tracking
  useEffect(() => {
    if (!isPlaying) return;
    
    // Start with progress at 0
    let progressValue = 0;
    const totalSteps = steps.length;
    
    const progressInterval = setInterval(() => {
      progressValue += (100 / (STEP_DURATION / 100));
      if (progressValue <= 100) {
        setProgress(progressValue);
      }
    }, 100);

    intervalRef.current = setTimeout(() => {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1);
        setProgress(0);
      } else {
        setIsPlaying(false);
      }
    }, STEP_DURATION);

    return () => {
      clearTimeout(intervalRef.current);
      clearInterval(progressInterval);
    };
  }, [isPlaying, currentStep, steps.length]);

  const goToStep = (index) => {
    setCurrentStep(index);
    setProgress(0);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setProgress(0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setProgress(0);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="min-h-screen flex flex-col bg-background" data-testid="tutorial-page">
      <Navbar />
      
      <main className="flex-1">
        <PageHero image={IMG.wander(1600)} eyebrow="Tutorial" title="See how Bleez works" subtitle="A quick guided tour of planning, booking and travelling with Bleez.AI." />
        {/* Progress bar */}
        <div className="fixed top-16 left-0 right-0 z-40 h-1 bg-white/10">
          <div 
            className="h-full bg-gradient-to-r from-primary to-amber-400 transition-all duration-100"
            style={{ width: `${((currentStep + progress/100) / steps.length) * 100}%` }}
          />
        </div>

        {/* Main content */}
        <div className="container-main py-12">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => goToStep(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep 
                    ? 'w-8 bg-primary' 
                    : idx < currentStep 
                      ? 'bg-primary/50' 
                      : 'bg-white/20'
                }`}
                title={s.title}
              />
            ))}
          </div>

          {/* Step counter */}
          <p className="text-center text-sm text-muted-foreground mb-8">
            Step {currentStep + 1} of {steps.length}
          </p>

          {/* Feature card */}
          <div className="max-w-4xl mx-auto">
            <div 
              className={`relative overflow-hidden rounded-3xl p-8 md:p-12 transition-all duration-500 ${step.animation}`}
              style={{
                background: `linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))`,
              }}
            >
              {/* Gradient background */}
              <div 
                className={`absolute inset-0 opacity-20 bg-gradient-to-br ${step.color}`}
              />
              
              {/* Content */}
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                {/* Icon */}
                <div className={`shrink-0 w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl`}>
                  <Icon className="w-16 h-16 md:w-20 md:h-20 text-white" />
                </div>
                
                {/* Text content */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{step.title}</h1>
                  <p className={`text-lg md:text-xl font-medium mb-4 bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                    {step.subtitle}
                  </p>
                  <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Features list */}
                  {step.features?.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                      {step.features.map((feature, idx) => (
                        <span 
                          key={idx}
                          className={`px-3 py-1.5 rounded-full text-sm bg-gradient-to-r ${step.color} bg-opacity-20 border border-white/10`}
                          style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Install instructions */}
                  {step.instructions && (
                    <div className="grid gap-3 mb-6">
                      {step.instructions.map((inst, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                          <Smartphone className="w-5 h-5 text-primary shrink-0" />
                          <div>
                            <p className="font-medium text-sm">{inst.platform}</p>
                            <p className="text-xs text-muted-foreground">{inst.steps}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Voices preview */}
                  {step.voices && (
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                      {step.voices.map((voice, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 rounded-full text-xs bg-white/10 border border-white/10 flex items-center gap-1"
                        >
                          <Volume2 className="w-3 h-3" />
                          {voice}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Demo button */}
                  {step.demoAction && (
                    <Button 
                      onClick={step.demoAction}
                      className={`bg-gradient-to-r ${step.color} text-white hover:opacity-90`}
                    >
                      Try it now <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}

                  {/* Final step CTA */}
                  {step.isFinal && (
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      <Button 
                        onClick={() => navigate('/plan')}
                        className="bg-gradient-to-r from-primary to-amber-500 text-background text-lg px-8 py-6"
                      >
                        Start Planning <Plane className="w-5 h-5 ml-2" />
                      </Button>
                      <Button 
                        onClick={() => navigate('/register')}
                        variant="outline"
                        className="text-lg px-8 py-6"
                      >
                        Create Account
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Step progress */}
              {isPlaying && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                  <div 
                    className={`h-full bg-gradient-to-r ${step.color} transition-all duration-100`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="w-12 h-12 rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={togglePlay}
              className="w-14 h-14 rounded-full border-primary/50"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
              className="w-12 h-12 rounded-full"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="ml-4"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Skip Tour
            </Button>
          </div>
        </div>
      </main>

      <Footer />

      {/* Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes fly {
          0% { transform: translateX(-20px) rotate(-5deg); opacity: 0; }
          100% { transform: translateX(0) rotate(0); opacity: 1; }
        }
        @keyframes slide-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes spread {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes drive {
          0% { transform: translateX(-10px); }
          100% { transform: translateX(0); }
        }
        @keyframes ring {
          0%, 100% { transform: rotate(0); }
          25% { transform: rotate(10deg); }
          75% { transform: rotate(-10deg); }
        }
        @keyframes celebrate {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.05) rotate(-2deg); }
          75% { transform: scale(1.05) rotate(2deg); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-pulse-scale { animation: pulse-scale 2s ease-in-out infinite; }
        .animate-fly { animation: fly 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.5s ease-out; }
        .animate-spread { animation: spread 0.5s ease-out; }
        .animate-drive { animation: drive 0.5s ease-out; }
        .animate-ring { animation: ring 1s ease-in-out infinite; }
        .animate-celebrate { animation: celebrate 1s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default TutorialPage;
