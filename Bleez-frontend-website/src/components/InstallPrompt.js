import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from './ui/button';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true;
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Listen for the beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after a delay (don't interrupt user immediately)
      const dismissed = localStorage.getItem('installPromptDismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 30000); // 30 seconds
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // If on iOS and not installed, show prompt after delay
    if (iOS && !standalone) {
      const dismissed = localStorage.getItem('installPromptDismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 30000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 animate-in slide-in-from-bottom-5">
      <div className="glass rounded-2xl p-4 border border-white/10 shadow-xl">
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6 text-background" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium text-sm mb-1">Install Bleez</h3>
            <p className="text-xs text-muted-foreground mb-3">
              {isIOS 
                ? 'Tap the share button, then "Add to Home Screen"'
                : 'Get quick access and offline support'
              }
            </p>
            
            {isIOS ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L8 6h3v8h2V6h3L12 2zm10 14v4c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-4h2v4h16v-4h2z"/>
                </svg>
                <span>Share</span>
                <span>→</span>
                <span>"Add to Home Screen"</span>
              </div>
            ) : (
              <Button 
                onClick={handleInstall}
                size="sm"
                className="w-full gold-gradient text-background gap-2"
              >
                <Download className="w-4 h-4" />
                Install App
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
