'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Home } from 'lucide-react';

interface BackToHomeButtonProps {
  threshold?: number;
}

export default function BackToHomeButton({ threshold = 400 }: BackToHomeButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-8 right-4 z-50 md:bottom-12 md:right-8"
        >
          <Link
            href="/"
            className="group flex items-center justify-center w-14 h-14 bg-gradient-to-r from-[#16a245] to-[#0d7a32] rounded-full shadow-2xl hover:shadow-[0_0_30px_rgba(22,162,69,0.4)] transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <Home className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
            
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full border-2 border-[#16a245]/30 animate-ping"></div>
            
            {/* Tooltip for desktop */}
            <div className="absolute right-full mr-3 px-3 py-2 bg-black/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none hidden md:block">
              Volver al Inicio
              <div className="absolute top-1/2 -translate-y-1/2 left-full w-0 h-0 border-l-4 border-l-black/90 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 