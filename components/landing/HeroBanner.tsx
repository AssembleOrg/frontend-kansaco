'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

// Componente reutilizable para efectos de neón
export const NeonBorders = ({
  intensity = 0.5,
  rotation = 0,
  className = '',
}: {
  intensity?: number;
  rotation?: number;
  className?: string;
}) => (
  <motion.div
    className={`pointer-events-none absolute inset-0 ${className}`}
    style={{
      opacity: intensity,
      filter: `hue-rotate(${rotation}deg)`,
    }}
  >
    {/* Top Border */}
    <motion.div
      className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#16a245] to-transparent shadow-[0_0_10px_#16a245]"
      animate={{
        opacity: [0.3, 1, 0.3],
        scale: [1, 1.02, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />

    {/* Right Border */}
    <motion.div
      className="absolute bottom-0 right-0 top-0 w-1 bg-gradient-to-b from-transparent via-[#16a245] to-transparent shadow-[0_0_10px_#16a245]"
      animate={{
        opacity: [0.3, 1, 0.3],
        scale: [1, 1.02, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 0.5,
      }}
    />

    {/* Bottom Border */}
    <motion.div
      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#16a245] to-transparent shadow-[0_0_10px_#16a245]"
      animate={{
        opacity: [0.3, 1, 0.3],
        scale: [1, 1.02, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 1,
      }}
    />

    {/* Left Border */}
    <motion.div
      className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-transparent via-[#16a245] to-transparent shadow-[0_0_10px_#16a245]"
      animate={{
        opacity: [0.3, 1, 0.3],
        scale: [1, 1.02, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 1.5,
      }}
    />

    {/* Corner Glow Effects */}
    <motion.div
      className="absolute left-0 top-0 h-8 w-8 rounded-full bg-[#16a245]/50 blur-sm"
      animate={{
        opacity: [0.5, 1, 0.5],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
    <motion.div
      className="absolute right-0 top-0 h-8 w-8 rounded-full bg-[#16a245]/50 blur-sm"
      animate={{
        opacity: [0.5, 1, 0.5],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 0.75,
      }}
    />
    <motion.div
      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#16a245]/50 blur-sm"
      animate={{
        opacity: [0.5, 1, 0.5],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 1.5,
      }}
    />
    <motion.div
      className="absolute bottom-0 left-0 h-8 w-8 rounded-full bg-[#16a245]/50 blur-sm"
      animate={{
        opacity: [0.5, 1, 0.5],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 2.25,
      }}
    />
  </motion.div>
);

const HeroBanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      console.log('Video loaded!'); // Debug log
      setIsVideoLoaded(true);
    };

    const handleCanPlay = () => {
      console.log('Video can play!'); // Debug log
      setIsVideoLoaded(true);
    };

    const handleError = (e: Event) => {
      console.log('Video error:', e); // Debug log
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    // Force set after a timeout as fallback
    const fallbackTimeout = setTimeout(() => {
      console.log('Setting video loaded via fallback'); // Debug log
      setIsVideoLoaded(true);
    }, 2000);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      clearTimeout(fallbackTimeout);
    };
  }, []);

  // Debug: Log current state
  console.log(
    'isVideoLoaded:',
    isVideoLoaded,
    'isPlaying:',
    isPlaying,
    'isMuted:',
    isMuted
  );

  const togglePlay = () => {
    console.log('Toggle play clicked!'); // Debug log
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    console.log('Toggle mute clicked!'); // Debug log
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Función para scroll smooth a la siguiente sección
  const scrollToNextSection = () => {
    const nextSection = document.querySelector('#categories') || 
                       document.querySelector('section[id]') || 
                       document.querySelector('main > section:nth-child(2)');
    
    if (nextSection) {
      nextSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      // Fallback: scroll down por viewport height
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white lg:flex-row">
      {/* Video Section - 2/3 - OCULTO EN MÓVILES */}
      <div className="relative hidden h-screen w-full lg:block lg:w-2/3">
        {/* Video Element */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
          poster="/landing/barril-mercedes.png"
        >
          <source src="/landing/banner.mp4" type="video/mp4" />
          Tu navegador no soporta el tag de video.
        </video>

        {/* Video Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/50"></div>

        {/* Minimal Video Controls - Bottom Left */}
        <motion.div
          className="absolute bottom-6 left-6 z-20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center gap-3 rounded-full border border-white/20 bg-black/40 p-3 backdrop-blur-md">
            <motion.button
              onClick={togglePlay}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-200 hover:bg-[#16a245]/80"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 text-[#16a245] drop-shadow-sm" />
              ) : (
                <Play className="ml-0.5 h-5 w-5 text-[#16a245] drop-shadow-sm" />
              )}
            </motion.button>

            <motion.button
              onClick={toggleMute}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-200 hover:bg-[#16a245]/80"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-[#16a245] drop-shadow-sm" />
              ) : (
                <Volume2 className="h-5 w-5 text-[#16a245] drop-shadow-sm" />
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Subtle Animated Particles */}
        <div className="absolute inset-0 hidden lg:block">
          <motion.div
            className="absolute left-20 top-20 h-1 w-1 rounded-full bg-[#16a245] opacity-40"
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute right-32 top-40 h-0.5 w-0.5 rounded-full bg-[#16a245] opacity-30"
            animate={{
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: 1,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-32 left-40 h-1.5 w-1.5 rounded-full bg-[#16a245] opacity-20"
            animate={{
              y: [0, -10, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 2,
              ease: 'easeInOut',
            }}
          />
        </div>
      </div>

      {/* Content Section - 1/3 en desktop, full width en móvil */}
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center text-center lg:h-screen lg:w-1/3 lg:items-start lg:text-left">
        {/* Simple Lightning Borders */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          {/* Top Lightning Border */}
          <motion.div
            className="absolute left-0 right-0 top-0 h-2 bg-gradient-to-r from-transparent via-[#16a245] to-transparent"
            animate={{
              opacity: [0.6, 1, 0.6],
              boxShadow: [
                '0 0 20px #16a245',
                '0 0 50px #16a245, 0 0 80px #16a245',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Right Lightning Border */}
          <motion.div
            className="absolute bottom-0 right-0 top-0 w-2 bg-gradient-to-b from-transparent via-[#16a245] to-transparent"
            animate={{
              opacity: [0.6, 1, 0.6],
              boxShadow: [
                '0 0 20px #16a245',
                '0 0 50px #16a245, 0 0 80px #16a245',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
          />

          {/* Bottom Lightning Border */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-[#16a245] to-transparent"
            animate={{
              opacity: [0.6, 1, 0.6],
              boxShadow: [
                '0 0 20px #16a245',
                '0 0 50px #16a245, 0 0 80px #16a245',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />

          {/* Left Lightning Border */}
          <motion.div
            className="absolute bottom-0 left-0 top-0 w-2 bg-gradient-to-b from-transparent via-[#16a245] to-transparent"
            animate={{
              opacity: [0.6, 1, 0.6],
              boxShadow: [
                '0 0 20px #16a245',
                '0 0 50px #16a245, 0 0 80px #16a245',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1.5,
            }}
          />

          {/* Corner Lightning Glows - Más grandes y brillantes */}
          <motion.div
            className="absolute left-0 top-0 h-8 w-8 rounded-full bg-[#16a245] blur-md"
            animate={{
              opacity: [0.7, 1, 0.7],
              scale: [1, 2, 1],
              boxShadow: [
                '0 0 30px #16a245',
                '0 0 60px #16a245, 0 0 100px #16a245',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.div
            className="absolute right-0 top-0 h-8 w-8 rounded-full bg-[#16a245] blur-md"
            animate={{
              opacity: [0.7, 1, 0.7],
              scale: [1, 2, 1],
              boxShadow: [
                '0 0 30px #16a245',
                '0 0 60px #16a245, 0 0 100px #16a245',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.75,
            }}
          />

          <motion.div
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#16a245] blur-md"
            animate={{
              opacity: [0.7, 1, 0.7],
              scale: [1, 2, 1],
              boxShadow: [
                '0 0 30px #16a245',
                '0 0 60px #16a245, 0 0 100px #16a245',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1.5,
            }}
          />

          <motion.div
            className="absolute bottom-0 left-0 h-8 w-8 rounded-full bg-[#16a245] blur-md"
            animate={{
              opacity: [0.7, 1, 0.7],
              scale: [1, 2, 1],
              boxShadow: [
                '0 0 30px #16a245',
                '0 0 60px #16a245, 0 0 100px #16a245',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2.25,
            }}
          />
        </motion.div>

        <div
          ref={contentRef}
          className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6 py-12 sm:px-8 lg:h-screen lg:items-start lg:px-12"
          style={{
            backgroundImage: "url('/landing/barril-garage.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Premium Overlay with Gradient - Lighter */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/50"></div>

          {/* Animated Background Elements */}
          <div className="absolute inset-0 hidden lg:block">
            <motion.div
              className="absolute right-10 top-10 h-32 w-32 rounded-full bg-[#16a245]/10 blur-3xl"
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute bottom-20 left-10 h-20 w-20 rounded-full bg-[#16a245]/20 blur-2xl"
              animate={{
                opacity: [0.2, 0.4, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: 1,
                ease: 'easeInOut',
              }}
            />
          </div>

          {/* Main Content */}
          <motion.div
            className="relative z-10 flex w-full max-w-2xl flex-col items-center lg:max-w-none lg:items-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Premium Badge */}
            <motion.div
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#16a245]/30 bg-[#16a245]/20 px-4 py-2 text-sm font-medium text-[#16a245] backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                className="h-2 w-2 rounded-full bg-[#16a245]"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              Ingeniería Premium
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              className="mb-6 text-4xl font-black leading-tight sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl 2xl:text-7xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <span className="bg-gradient-to-r from-[#f7faf8] via-white to-[#e6f5eb] bg-clip-text text-transparent">
                KANSACO
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#16a245] via-[#0d7a32] to-[#16a245] bg-clip-text text-transparent">
                Ingeniería
              </span>
              <br />
              <span className="font-light text-white">Líquida.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="mb-8 max-w-lg text-base leading-relaxed text-gray-200 sm:text-lg lg:max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Descubre la{' '}
              <span className="font-semibold text-[#16a245]">protección</span> y{' '}
              <span className="font-semibold text-[#16a245]">rendimiento</span>{' '}
              que tu vehículo merece.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex w-full max-w-sm flex-col gap-4 sm:max-w-none sm:flex-row lg:w-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  size="lg"
                  className="group relative overflow-hidden border-none bg-gradient-to-r from-[#16a245] to-[#0d7a32] px-6 py-3 text-base font-bold text-white shadow-2xl transition-all duration-300 hover:from-[#0d7a32] hover:to-[#16a245] hover:shadow-[#16a245]/25 sm:px-8 sm:py-4 sm:text-lg"
                >
                  <Link
                    href="/productos"
                    className="flex items-center justify-center gap-2"
                  >
                    <span className="relative z-10">Ver Productos</span>
                    <div className="absolute inset-0 translate-x-[-100%] skew-x-12 bg-white/20 transition-transform duration-700 group-hover:translate-x-[100%]"></div>
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="group border-2 border-[#16a245]/50 bg-black/20 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-[#16a245] hover:bg-[#16a245]/20 hover:text-white sm:px-8 sm:py-4 sm:text-lg"
                >
                  <Link
                    href="/contacto"
                    className="flex items-center justify-center gap-2"
                  >
                    Contactar Ahora
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="mt-8 grid grid-cols-1 gap-4 text-sm text-gray-400 sm:flex sm:items-center sm:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <motion.div
                  className="h-2 w-2 rounded-full bg-[#16a245]"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span>Calidad Premium</span>
              </div>
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <motion.div
                  className="h-2 w-2 rounded-full bg-[#16a245]"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                <span>Envío Gratuito</span>
              </div>
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <motion.div
                  className="h-2 w-2 rounded-full bg-[#16a245]"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
                <span>Garantía Total</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator - Con funcionalidad de scroll */}
      <motion.button
        onClick={scrollToNextSection}
        className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2 transform cursor-pointer lg:left-1/3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <div className="flex flex-col items-center gap-2 text-white/60 transition-colors duration-300 hover:text-[#16a245]">
          <span className="text-sm font-medium">Descubre más</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-full bg-white/10 p-2 backdrop-blur-sm transition-all duration-300 hover:bg-[#16a245]/20"
          >
            <ChevronDown className="h-6 w-6 text-[#16a245] drop-shadow-sm" />
          </motion.div>
        </div>
      </motion.button>
    </section>
  );
};

export default HeroBanner;
