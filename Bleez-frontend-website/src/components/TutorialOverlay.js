import React, { useEffect, useState } from 'react';
import { useTutorial } from '../contexts/TutorialContext';
import { Button } from './ui/button';
import { X, ChevronLeft, ChevronRight, Play, Smartphone, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TutorialOverlay = () => {
  const navigate = useNavigate();
  const {
    isActive,
    step,
    currentStep,
    steps,
    progress,
    nextStep,
    prevStep,
    skipTutorial
  } = useTutorial();
  
  const [targetRect, setTargetRect] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isActive || !step) return;

    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);

    // Find target element
    if (step.target) {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }

    return () => clearTimeout(timer);
  }, [isActive, step, currentStep]);

  if (!isActive || !step) return null;

  const getTooltipPosition = () => {
    if (!targetRect || step.position === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const padding = 16;
    const tooltipWidth = 360;

    switch (step.position) {
      case 'bottom':
        return {
          position: 'fixed',
          top: targetRect.bottom + padding,
          left: Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))
        };
      case 'top':
        return {
          position: 'fixed',
          bottom: window.innerHeight - targetRect.top + padding,
          left: Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))
        };
      case 'left':
        return {
          position: 'fixed',
          top: targetRect.top + targetRect.height / 2 - 80,
          right: window.innerWidth - targetRect.left + padding
        };
      case 'right':
        return {
          position: 'fixed',
          top: targetRect.top + targetRect.height / 2 - 80,
          left: targetRect.right + padding
        };
      default:
        return {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-[9999]" data-testid="tutorial-overlay">
      {/* Backdrop with spotlight */}
      <div 
        className="absolute inset-0 bg-black/80 transition-opacity duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Spotlight cutout for target element */}
        {targetRect && (
          <div
            className="absolute rounded-xl transition-all duration-300"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.8)',
              border: '2px solid #7C3AED',
              animation: 'pulse-border 2s ease-in-out infinite'
            }}
          />
        )}
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
        <div 
          className="h-full gold-gradient transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
        <span className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>

      {/* Tooltip */}
      <div
        className={`w-[360px] max-w-[calc(100vw-32px)] glass rounded-2xl p-6 shadow-2xl border border-white/20 transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
        style={getTooltipPosition()}
      >
        {/* Close button */}
        <button
          onClick={skipTutorial}
          className="absolute top-3 right-3 text-muted-foreground hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon for special steps */}
        {step.showInstallTip && (
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Smartphone className="w-7 h-7 text-green-400" />
            </div>
            <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Download className="w-7 h-7 text-blue-400" />
            </div>
          </div>
        )}

        {/* Content */}
        <h3 className="text-xl font-semibold mb-2 pr-6">{step.title}</h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">{step.description}</p>

        {/* Install tips for mobile */}
        {step.showInstallTip && (
          <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-sm font-medium mb-2">How to install:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li><strong>Android:</strong> Tap menu (⋮) → "Add to Home Screen"</li>
              <li><strong>iOS Safari:</strong> Tap Share (↑) → "Add to Home Screen"</li>
              <li><strong>Chrome:</strong> Look for install icon in address bar</li>
            </ul>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={skipTutorial}
            className="text-muted-foreground"
          >
            Skip Tour
          </Button>

          <Button
            onClick={nextStep}
            size="sm"
            className="gold-gradient text-background gap-1"
          >
            {step.isFinal ? (
              <>Start Exploring<Play className="w-4 h-4" /></>
            ) : (
              <>Next<ChevronRight className="w-4 h-4" /></>
            )}
          </Button>
        </div>
      </div>

      {/* Pulse animation style */}
      <style>{`
        @keyframes pulse-border {
          0%, 100% { border-color: #7C3AED; box-shadow: 0 0 0 9999px rgba(0,0,0,0.8), 0 0 20px rgba(212,168,83,0.3); }
          50% { border-color: #f0d78c; box-shadow: 0 0 0 9999px rgba(0,0,0,0.8), 0 0 30px rgba(212,168,83,0.5); }
        }
      `}</style>
    </div>
  );
};

export default TutorialOverlay;
