'use client';

import { useState, useEffect } from 'react';

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: 1200, // default to desktop
  });

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      setState({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width,
      });
    };

    updateState();
    window.addEventListener('resize', updateState);
    return () => window.removeEventListener('resize', updateState);
  }, []);

  return state;
}

// Animation variants optimized for mobile
export const getResponsiveAnimationVariants = (isMobile: boolean) => ({
  // For elements that slide from right - use Y animation on mobile to prevent overflow
  slideFromRight: {
    initial: { opacity: 0, x: isMobile ? 0 : 50, y: isMobile ? 30 : 0 },
    animate: { opacity: 1, x: 0, y: 0 },
  },
  
  // For elements that slide from left
  slideFromLeft: {
    initial: { opacity: 0, x: isMobile ? 0 : -50, y: isMobile ? 30 : 0 },
    animate: { opacity: 1, x: 0, y: 0 },
  },
  
  // Safe fade up for mobile
  fadeUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
  },
  
  // Scale animation (safer for mobile)
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  }
}); 