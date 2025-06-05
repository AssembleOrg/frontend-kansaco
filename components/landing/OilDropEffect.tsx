'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

interface OilDropEffectProps {
  x?: string | number; // Posición horizontal (ej: "50%" o 200)
  y?: string | number; // Posición vertical (ej: "20px" o 50)
  size?: 'small' | 'medium' | 'large'; // Tamaño del efecto
  intensity?: 'subtle' | 'normal' | 'strong'; // Intensidad de las ondas
}

const OilDropEffect = ({
  x = '50%',
  y = '50%',
  size = 'medium',
  intensity = 'normal',
}: OilDropEffectProps) => {
  const { scrollYProgress } = useScroll();
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Detectar cuando estamos al final absoluto del scroll
  const bottomTrigger = useTransform(scrollYProgress, [0.95, 1], [0, 1]);

  useEffect(() => {
    const unsubscribe = bottomTrigger.onChange((value) => {
      const isNowAtBottom = value > 0.8;
      setIsAtBottom(isNowAtBottom);

      // Si llegamos al bottom y no hemos disparado aún, o si salimos y volvemos
      if (isNowAtBottom && (!hasTriggered || !isAtBottom)) {
        setShouldAnimate(true);
        setHasTriggered(true);

        // Reset para permitir nueva animación después de un tiempo
        setTimeout(() => {
          setShouldAnimate(false);
        }, 4000); // Duración total de la animación
      }
    });
    return unsubscribe;
  }, [bottomTrigger, hasTriggered, isAtBottom]);

  // Configuraciones basadas en props
  const sizeConfig = {
    small: { maxRadius: 60, waves: 3, duration: 2 },
    medium: { maxRadius: 100, waves: 4, duration: 2.5 },
    large: { maxRadius: 150, waves: 5, duration: 3 },
  };

  const intensityConfig = {
    subtle: { opacity: 0.3, blur: 'blur-sm' },
    normal: { opacity: 0.6, blur: 'blur-none' },
    strong: { opacity: 0.8, blur: 'blur-none' },
  };

  const config = sizeConfig[size];
  const intensitySettings = intensityConfig[intensity];

  // Solo renderizar si estamos al final del scroll y debe animar
  if (!isAtBottom || !shouldAnimate) return null;

  return (
    <div
      className="pointer-events-none fixed z-40"
      style={{
        left: typeof x === 'string' ? x : `${x}px`,
        top: typeof y === 'string' ? y : `${y}px`,
        transform: 'translate(-50%, -50%)', // Centrar en la posición
      }}
    >
      {/* Ondas concéntricas de aceite */}
      {Array.from({ length: config.waves }).map((_, i) => (
        <motion.div
          key={`oil-wave-${i}`}
          className={`absolute rounded-full border-2 border-[#16a245] ${intensitySettings.blur}`}
          style={{
            width: 0,
            height: 0,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          initial={{
            width: 0,
            height: 0,
            opacity: 0,
            borderColor: '#16a245',
          }}
          animate={{
            width: config.maxRadius * (1 + i * 0.3),
            height: config.maxRadius * (1 + i * 0.3),
            opacity: [0, intensitySettings.opacity, 0],
            borderColor: ['#16a245', '#0d7a32', '#16a245'],
          }}
          transition={{
            duration: config.duration,
            delay: i * 0.2, // Stagger between waves
            ease: [0.25, 0.46, 0.45, 0.94], // Viscous easing like oil
          }}
        />
      ))}

      {/* Efecto de splash central */}
      <motion.div
        className="absolute rounded-full bg-[#16a245]"
        style={{
          width: 8,
          height: 8,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        initial={{
          scale: 0,
          opacity: 0,
        }}
        animate={{
          scale: [0, 2, 1.5, 0],
          opacity: [0, 0.8, 0.4, 0],
        }}
        transition={{
          duration: 1.5,
          ease: 'easeOut',
        }}
      />

      {/* Gotas satelitales */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = i * 60 * (Math.PI / 180); // 60 degrees between drops
        const distance = 5 + i * 5; // Variable distance

        return (
          <motion.div
            key={`satellite-drop-${i}`}
            className="absolute h-1 w-1 rounded-full bg-[#16a245]"
            style={{
              left: '50%',
              top: '50%',
            }}
            initial={{
              x: 0,
              y: 0,
              scale: 0,
              opacity: 0,
            }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              scale: [0, 1.5, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 2,
              delay: 0.5 + i * 0.1,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          />
        );
      })}

      {/* Efecto de brillo/reflejo */}
      <motion.div
        className="bg-gradient-radial absolute rounded-full from-[#16a245]/20 via-[#16a245]/10 to-transparent"
        style={{
          width: config.maxRadius * 0.6,
          height: config.maxRadius * 0.6,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        initial={{
          scale: 0,
          opacity: 0,
        }}
        animate={{
          scale: [0, 1.2, 1, 0.8],
          opacity: [0, 0.4, 0.2, 0],
        }}
        transition={{
          duration: 3,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

export default OilDropEffect;
