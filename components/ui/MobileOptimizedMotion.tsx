'use client';

import { motion, MotionProps } from 'framer-motion';
import { useResponsive } from '@/hooks/useResponsive';
import { ReactNode } from 'react';

interface MobileOptimizedMotionProps extends Omit<MotionProps, 'initial' | 'whileInView'> {
  children: ReactNode;
  slideDirection?: 'left' | 'right' | 'up' | 'down' | 'none';
  className?: string;
  delay?: number;
}

export default function MobileOptimizedMotion({
  children,
  slideDirection = 'up',
  className,
  delay = 0,
  ...motionProps
}: MobileOptimizedMotionProps) {
  const { isMobile } = useResponsive();

  // Mobile-safe animation variants
  const getAnimationVariants = () => {
    if (isMobile) {
      // On mobile, use only safe Y animations to prevent horizontal overflow
      return {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
      };
    }

    // Desktop animations with full directional support
    switch (slideDirection) {
      case 'left':
        return {
          initial: { opacity: 0, x: -50 },
          whileInView: { opacity: 1, x: 0 },
        };
      case 'right':
        return {
          initial: { opacity: 0, x: 50 },
          whileInView: { opacity: 1, x: 0 },
        };
      case 'up':
        return {
          initial: { opacity: 0, y: 30 },
          whileInView: { opacity: 1, y: 0 },
        };
      case 'down':
        return {
          initial: { opacity: 0, y: -30 },
          whileInView: { opacity: 1, y: 0 },
        };
      case 'none':
        return {
          initial: { opacity: 0 },
          whileInView: { opacity: 1 },
        };
      default:
        return {
          initial: { opacity: 0, y: 30 },
          whileInView: { opacity: 1, y: 0 },
        };
    }
  };

  const variants = getAnimationVariants();

  return (
    <motion.div
      initial={variants.initial}
      whileInView={variants.whileInView}
      transition={{ 
        duration: isMobile ? 0.6 : 1, 
        delay,
        ease: "easeOut"
      }}
      viewport={{ once: true, margin: "-50px" }}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
} 