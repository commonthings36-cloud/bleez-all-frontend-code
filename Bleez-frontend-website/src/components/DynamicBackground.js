import React, { useEffect, useRef, useMemo } from 'react';
import { useDynamicBackground } from '../contexts/DynamicBackgroundContext';

// Seeded random generator for consistent values
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Pre-generate random values for particles/shapes
const generateRandomValues = (count, seed = 42) => {
  return Array.from({ length: count }, (_, i) => ({
    r1: seededRandom(seed + i * 1),
    r2: seededRandom(seed + i * 2),
    r3: seededRandom(seed + i * 3),
    r4: seededRandom(seed + i * 4),
    r5: seededRandom(seed + i * 5)
  }));
};

// Pre-computed random values
const PARTICLE_RANDOMS = generateRandomValues(12, 42);
const ORB_RANDOMS = generateRandomValues(6, 123);
const SHAPE_RANDOMS = generateRandomValues(6, 456);

// Animated particle component
const FloatingParticle = ({ emoji, delay, duration, startX, startY, size }) => {
  return (
    <div
      className="absolute pointer-events-none select-none animate-float-particle"
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
        fontSize: `${size}rem`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        opacity: 0.15,
        filter: 'blur(0.5px)',
        zIndex: 0
      }}
    >
      {emoji}
    </div>
  );
};

// Animated gradient orb
const GradientOrb = ({ color, size, x, y, delay, blur = 100 }) => {
  return (
    <div
      className="absolute rounded-full pointer-events-none animate-orb-pulse"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${x}%`,
        top: `${y}%`,
        background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
        filter: `blur(${blur}px)`,
        animationDelay: `${delay}s`,
        transform: 'translate(-50%, -50%)',
        zIndex: 0
      }}
    />
  );
};

// Grid pattern overlay
const GridPattern = ({ opacity = 0.03 }) => {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,${opacity}) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,${opacity}) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        zIndex: 0
      }}
    />
  );
};

// Noise texture overlay
const NoiseOverlay = ({ opacity = 0.015 }) => {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        opacity: opacity,
        zIndex: 1
      }}
    />
  );
};

// Radial vignette effect
const Vignette = ({ intensity = 0.3 }) => {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,${intensity}) 100%)`,
        zIndex: 1
      }}
    />
  );
};

// Animated lines pattern
const AnimatedLines = ({ color, direction = 'horizontal' }) => {
  const isHorizontal = direction === 'horizontal';
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="absolute animate-line-flow"
          style={{
            [isHorizontal ? 'left' : 'top']: '-100%',
            [isHorizontal ? 'top' : 'left']: `${15 + i * 20}%`,
            [isHorizontal ? 'width' : 'height']: '200%',
            [isHorizontal ? 'height' : 'width']: '1px',
            background: `linear-gradient(${isHorizontal ? '90deg' : '180deg'}, transparent 0%, ${color}30 50%, transparent 100%)`,
            animationDelay: `${i * 2}s`,
            animationDuration: '8s'
          }}
        />
      ))}
    </div>
  );
};

// Floating shapes
const FloatingShapes = ({ colors }) => {
  const shapes = useMemo(() => {
    return SHAPE_RANDOMS.map((r, i) => ({
      id: i,
      type: ['circle', 'square', 'triangle'][i % 3],
      x: r.r1 * 100,
      y: r.r2 * 100,
      size: 20 + r.r3 * 40,
      rotation: r.r4 * 360,
      delay: r.r5 * 5,
      duration: 15 + r.r1 * 10,
      color: colors[i % colors.length]
    }));
  }, [colors]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {shapes.map(shape => (
        <div
          key={shape.id}
          className="absolute animate-shape-float"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            border: `1px solid ${shape.color}20`,
            borderRadius: shape.type === 'circle' ? '50%' : shape.type === 'square' ? '4px' : '0',
            transform: `rotate(${shape.rotation}deg)`,
            animationDelay: `${shape.delay}s`,
            animationDuration: `${shape.duration}s`,
            opacity: 0.1
          }}
        />
      ))}
    </div>
  );
};

// Main Dynamic Background Component
const DynamicBackground = ({ children, className = '' }) => {
  const { theme, visuals, timeAdjustment, isTransitioning, getCSSVariables } = useDynamicBackground();
  const containerRef = useRef(null);
  const mountedRef = useRef(false);
  
  // Generate particles using pre-computed random values
  const particles = useMemo(() => {
    if (!visuals.particles) return [];
    
    return PARTICLE_RANDOMS.map((r, i) => ({
      id: i,
      emoji: visuals.particles[i % visuals.particles.length],
      delay: r.r1 * 10,
      duration: 15 + r.r2 * 20,
      startX: r.r3 * 100,
      startY: 100 + r.r4 * 20,
      size: 1.5 + r.r5 * 1.5
    }));
  }, [visuals.particles]);

  // Generate gradient orbs
  const orbs = useMemo(() => {
    if (!visuals.colors) return [];
    
    return visuals.colors.map((color, i) => ({
      id: i,
      color,
      size: 200 + ORB_RANDOMS[i].r1 * 300,
      x: 20 + (i * 30) + ORB_RANDOMS[i].r2 * 20,
      y: 20 + ORB_RANDOMS[i].r3 * 60,
      delay: i * 2,
      blur: 80 + ORB_RANDOMS[i].r4 * 40
    }));
  }, [visuals.colors]);

  // Apply CSS variables - only updates DOM, no state changes
  useEffect(() => {
    mountedRef.current = true;
    if (containerRef.current) {
      const vars = getCSSVariables();
      Object.entries(vars).forEach(([key, value]) => {
        containerRef.current.style.setProperty(key, String(value));
      });
    }
  }, [getCSSVariables]);

  // Determine which pattern to show based on theme
  const showLines = ['maps', 'location', 'journey', 'planning'].includes(visuals.pattern);
  const showShapes = ['culture', 'business', 'default'].includes(visuals.pattern);
  const showGrid = ['business', 'city'].includes(visuals.pattern);

  return (
    <div
      ref={containerRef}
      className={`relative min-h-screen overflow-hidden ${className}`}
      style={{
        transition: 'all 0.5s ease-in-out',
        opacity: isTransitioning ? 0.95 : 1
      }}
    >
      {/* Base gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`}
        style={{
          filter: `brightness(${timeAdjustment.brightness})`,
          transition: 'all 0.5s ease-in-out'
        }}
      />

      {/* Time-based ambient color overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: timeAdjustment.ambientColor,
          mixBlendMode: 'overlay',
          transition: 'all 0.5s ease-in-out'
        }}
      />

      {/* Gradient orbs */}
      {orbs.map(orb => (
        <GradientOrb key={orb.id} {...orb} />
      ))}

      {/* Floating particles */}
      {particles.map(particle => (
        <FloatingParticle key={particle.id} {...particle} />
      ))}

      {/* Conditional pattern overlays */}
      {showLines && <AnimatedLines color={theme.accent} direction="horizontal" />}
      {showShapes && <FloatingShapes colors={visuals.colors || ['#7C3AED']} />}
      {showGrid && <GridPattern opacity={0.02} />}

      {/* Noise texture for premium feel */}
      <NoiseOverlay opacity={0.02} />

      {/* Vignette effect */}
      <Vignette intensity={0.25} />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default DynamicBackground;

export {
  FloatingParticle,
  GradientOrb,
  GridPattern,
  NoiseOverlay,
  Vignette,
  AnimatedLines,
  FloatingShapes
};
