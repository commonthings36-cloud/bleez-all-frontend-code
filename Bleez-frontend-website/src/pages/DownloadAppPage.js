import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { IMG } from '../data/travelImages';
import { Navbar, Footer } from '../components/Layout';
import { Button } from '../components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Smartphone, Download, Apple, Chrome, Share2, Plus, 
  CheckCircle2, Wifi, Bell, Zap, MapPin, Globe, Shield,
  ArrowRight, QrCode, Monitor, Tablet
} from 'lucide-react';

const DownloadAppPage = () => {
  const [platform, setPlatform] = useState('unknown');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMac = /macintosh|mac os x/.test(userAgent);
    const isWindows = /windows/.test(userAgent);
    
    if (isIOS) setPlatform('ios');
    else if (isAndroid) setPlatform('android');
    else if (isMac) setPlatform('mac');
    else if (isWindows) setPlatform('windows');
    else setPlatform('desktop');

    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true;
    setIsInstalled(standalone);

    // Listen for install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstalled(true);
      }
    }
  };

  const features = [
    { icon: Wifi, title: "Works Offline", desc: "Access your itineraries even without internet" },
    { icon: Bell, title: "Push Notifications", desc: "Get real-time alerts for your trips" },
    { icon: Zap, title: "Lightning Fast", desc: "Native-like performance and speed" },
    { icon: MapPin, title: "GPS Integration", desc: "Location-based recommendations" },
    { icon: Globe, title: "Always Updated", desc: "No app store updates needed" },
    { icon: Shield, title: "Secure & Private", desc: "Your data stays on your device" }
  ];

  const renderPlatformIcon = () => {
    switch (platform) {
      case 'ios': return <Apple className="w-6 h-6" />;
      case 'android': return <Smartphone className="w-6 h-6" />;
      case 'mac': return <Monitor className="w-6 h-6" />;
      default: return <Chrome className="w-6 h-6" />;
    }
  };

  const getPlatformName = () => {
    switch (platform) {
      case 'ios': return 'iPhone/iPad';
      case 'android': return 'Android';
      case 'mac': return 'Mac';
      case 'windows': return 'Windows';
      default: return 'Desktop';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <PageHero image={IMG.wander(1600)} eyebrow="Get the app" title="Take Bleez with you" subtitle="Install the app and plan on the go." />
      
      <main className="flex-1 pt-10 pb-16">
        <div className="container-main">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
              <Download className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary">Free Download</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif tracking-tight mb-6">
              Get <span className="gold-text">Bleez</span> on Your Device
            </h1>
            
            <p className="text-base lg:text-lg text-muted-foreground max-w-xl mx-auto">
              Install our app for the best travel planning experience. Access your trips offline, 
              get push notifications, and enjoy lightning-fast performance.
            </p>
          </div>

          {/* Main Install Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-20">
            {/* Left - App Preview */}
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto relative">
                {/* Phone mockup */}
                <div className="absolute inset-8 rounded-[3rem] bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-slate-700 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-slate-900 rounded-b-2xl" />
                  <div className="p-4 pt-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center">
                        <span className="text-background font-bold text-lg">AI</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Bleez</p>
                        <p className="text-xs text-muted-foreground">Your Travel Companion</p>
                      </div>
                    </div>
                    
                    {/* Mini app preview */}
                    <div className="space-y-3">
                      <div className="h-32 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <MapPin className="w-10 h-10 text-primary/60" />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 h-16 rounded-lg bg-white/5" />
                        <div className="flex-1 h-16 rounded-lg bg-white/5" />
                      </div>
                      <div className="h-20 rounded-lg bg-white/5" />
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-24 h-24 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute bottom-4 left-4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
              </div>
            </div>

            {/* Right - Install Options */}
            <div className="flex flex-col justify-center">
              {isInstalled ? (
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-green-500/10 border border-green-500/20 mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="font-semibold text-green-400">App Installed!</p>
                      <p className="text-sm text-muted-foreground">You're all set to use Bleez</p>
                    </div>
                  </div>
                  <Link to="/plan">
                    <Button className="btn-primary text-lg px-8 py-6 gap-2">
                      Start Planning
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Detected Platform */}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                    {renderPlatformIcon()}
                    <span>Detected: {getPlatformName()}</span>
                  </div>

                  {/* iOS Instructions */}
                  {platform === 'ios' && (
                    <div className="p-6 rounded-2xl glass border border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <Apple className="w-8 h-8 text-white" />
                        <h3 className="text-lg font-semibold">Install on iPhone/iPad</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-primary">1</span>
                          </div>
                          <div>
                            <p className="font-medium">Tap the Share button</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              Look for <Share2 className="w-4 h-4" /> at the bottom of Safari
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-primary">2</span>
                          </div>
                          <div>
                            <p className="font-medium">Scroll and tap "Add to Home Screen"</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              Look for <Plus className="w-4 h-4" /> Add to Home Screen
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-primary">3</span>
                          </div>
                          <div>
                            <p className="font-medium">Tap "Add" to confirm</p>
                            <p className="text-sm text-muted-foreground">The app icon will appear on your home screen</p>
                          </div>
                        </div>
                      </div>

                      {/* Visual Guide */}
                      <div className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-white/5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Safari required</span>
                          <span className="text-primary">Works best on Safari</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Android / Chrome Instructions */}
                  {(platform === 'android' || deferredPrompt) && (
                    <div className="p-6 rounded-2xl glass border border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <Smartphone className="w-8 h-8 text-green-400" />
                        <h3 className="text-lg font-semibold">Install on Android</h3>
                      </div>
                      
                      {deferredPrompt ? (
                        <div className="space-y-4">
                          <p className="text-muted-foreground">
                            Click the button below to add Bleez to your home screen for quick access.
                          </p>
                          <Button 
                            onClick={handleInstallClick}
                            className="w-full gold-gradient text-background text-lg py-6 gap-2"
                          >
                            <Download className="w-5 h-5" />
                            Install App Now
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                              <span className="text-sm font-bold text-green-400">1</span>
                            </div>
                            <div>
                              <p className="font-medium">Tap the menu (⋮) in Chrome</p>
                              <p className="text-sm text-muted-foreground">Top right corner of your browser</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                              <span className="text-sm font-bold text-green-400">2</span>
                            </div>
                            <div>
                              <p className="font-medium">Select "Install app" or "Add to Home screen"</p>
                              <p className="text-sm text-muted-foreground">It may say "Install Bleez"</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                              <span className="text-sm font-bold text-green-400">3</span>
                            </div>
                            <div>
                              <p className="font-medium">Tap "Install" to confirm</p>
                              <p className="text-sm text-muted-foreground">The app will be added to your home screen</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Desktop Instructions */}
                  {(platform === 'mac' || platform === 'windows' || platform === 'desktop') && !deferredPrompt && (
                    <div className="p-6 rounded-2xl glass border border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <Chrome className="w-8 h-8 text-blue-400" />
                        <h3 className="text-lg font-semibold">Install on Desktop</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-blue-400">1</span>
                          </div>
                          <div>
                            <p className="font-medium">Look for the install icon in the address bar</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Download className="w-4 h-4" /> or <Plus className="w-4 h-4" /> icon in Chrome/Edge
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-blue-400">2</span>
                          </div>
                          <div>
                            <p className="font-medium">Click "Install" in the popup</p>
                            <p className="text-sm text-muted-foreground">Or use Chrome menu → "Install Bleez"</p>
                          </div>
                        </div>
                      </div>

                      {deferredPrompt && (
                        <Button 
                          onClick={handleInstallClick}
                          className="w-full mt-4 gold-gradient text-background text-lg py-6 gap-2"
                        >
                          <Download className="w-5 h-5" />
                          Install App Now
                        </Button>
                      )}
                    </div>
                  )}

                  {/* QR Code Option */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <button 
                      onClick={() => setShowQR(!showQR)}
                      className="w-full flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <QrCode className="w-6 h-6 text-primary" />
                        <div className="text-left">
                          <p className="font-medium">Scan QR Code</p>
                          <p className="text-sm text-muted-foreground">Open on your mobile device</p>
                        </div>
                      </div>
                      <ArrowRight className={`w-5 h-5 transition-transform ${showQR ? 'rotate-90' : ''}`} />
                    </button>
                    
                    {showQR && (
                      <div className="mt-4 flex flex-col items-center">
                        <div className="p-4 bg-white rounded-2xl shadow-lg">
                          <QRCodeSVG 
                            value={window.location.origin}
                            size={160}
                            level="H"
                            includeMargin={false}
                            bgColor="#ffffff"
                            fgColor="#0a0a0f"
                            imageSettings={{
                              src: "/icons/icon-72x72.png",
                              x: undefined,
                              y: undefined,
                              height: 32,
                              width: 32,
                              excavate: true,
                            }}
                          />
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground text-center">
                          Scan with your phone's camera to open Bleez
                        </p>
                        <p className="mt-1 text-xs text-primary/70 text-center break-all max-w-[200px]">
                          {window.location.origin}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-serif text-center mb-10">
              Why Install the App?
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <div 
                  key={idx}
                  className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* All Platforms Section */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-serif mb-6">
              Available on All Platforms
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Bleez works on any device with a modern browser. 
              One app, everywhere you go.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 px-6 py-3 rounded-xl glass border border-white/10">
                <Apple className="w-5 h-5" />
                <span>iPhone & iPad</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 rounded-xl glass border border-white/10">
                <Smartphone className="w-5 h-5" />
                <span>Android</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 rounded-xl glass border border-white/10">
                <Monitor className="w-5 h-5" />
                <span>Windows</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 rounded-xl glass border border-white/10">
                <Apple className="w-5 h-5" />
                <span>macOS</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 rounded-xl glass border border-white/10">
                <Chrome className="w-5 h-5" />
                <span>Chrome OS</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DownloadAppPage;
