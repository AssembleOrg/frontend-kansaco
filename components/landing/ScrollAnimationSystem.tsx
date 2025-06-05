'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const ScrollAnimationSystem = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Transform scroll progress to different animation phases
  const lightningOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.3, 0.8, 0.8, 0.3]
  );

  return (
    <motion.div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-30"
      style={{ opacity: lightningOpacity }}
    >
      {/* Main Lightning Network */}
      <motion.div className="absolute inset-0">
        {/* Central Energy Line */}
        <motion.div
          className="absolute right-8 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-[#16a245] to-transparent"
          style={{
            scaleY: useTransform(
              scrollYProgress,
              [0, 0.1, 0.9, 1],
              [0, 1, 1, 0]
            ),
            boxShadow: useTransform(
              scrollYProgress,
              [0, 0.5, 1],
              [
                '0 0 10px #16a245',
                '0 0 30px #16a245, 0 0 50px #16a245',
                '0 0 10px #16a245',
              ]
            ),
          }}
        />

        {/* Energy Particles flowing along the line - Manual creation */}
        <motion.div
          className="absolute right-7 h-1 w-1 rounded-full bg-[#16a245]"
          style={{
            top: useTransform(scrollYProgress, [0, 1], ['10%', '75%']),
            opacity: useTransform(
              scrollYProgress,
              [0, 0.1, 0.9, 1],
              [0, 1, 1, 0]
            ),
            scale: useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 2, 1]),
          }}
          animate={{
            boxShadow: [
              '0 0 5px #16a245',
              '0 0 15px #16a245, 0 0 25px #16a245',
              '0 0 5px #16a245',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="absolute right-7 h-1 w-1 rounded-full bg-[#16a245]"
          style={{
            top: useTransform(scrollYProgress, [0, 1], ['25%', '65%']),
            opacity: useTransform(
              scrollYProgress,
              [0, 0.1, 0.9, 1],
              [0, 1, 1, 0]
            ),
            scale: useTransform(scrollYProgress, [0.1, 0.2, 0.3], [1, 2, 1]),
          }}
          animate={{
            boxShadow: [
              '0 0 5px #16a245',
              '0 0 15px #16a245, 0 0 25px #16a245',
              '0 0 5px #16a245',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.3,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute right-7 h-1 w-1 rounded-full bg-[#16a245]"
          style={{
            top: useTransform(scrollYProgress, [0, 1], ['40%', '55%']),
            opacity: useTransform(
              scrollYProgress,
              [0, 0.1, 0.9, 1],
              [0, 1, 1, 0]
            ),
            scale: useTransform(scrollYProgress, [0.2, 0.3, 0.4], [1, 2, 1]),
          }}
          animate={{
            boxShadow: [
              '0 0 5px #16a245',
              '0 0 15px #16a245, 0 0 25px #16a245',
              '0 0 5px #16a245',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.6,
            ease: 'easeInOut',
          }}
        />

        {/* Branching Lightning Effects */}
        <motion.div
          className="absolute h-px bg-gradient-to-r from-[#16a245]/60 via-[#16a245]/80 to-transparent"
          style={{
            right: '32px',
            width: '150px',
            top: '25%',
            opacity: useTransform(scrollYProgress, [0, 0.1, 0.3], [0, 1, 0]),
            scaleX: useTransform(scrollYProgress, [0, 0.15], [0, 1]),
          }}
        />

        <motion.div
          className="absolute h-px bg-gradient-to-r from-[#16a245]/60 via-[#16a245]/80 to-transparent"
          style={{
            right: '32px',
            width: '150px',
            top: '45%',
            opacity: useTransform(scrollYProgress, [0.2, 0.3, 0.5], [0, 1, 0]),
            scaleX: useTransform(scrollYProgress, [0.2, 0.35], [0, 1]),
          }}
        />

        <motion.div
          className="absolute h-px bg-gradient-to-r from-[#16a245]/60 via-[#16a245]/80 to-transparent"
          style={{
            right: '32px',
            width: '150px',
            top: '65%',
            opacity: useTransform(scrollYProgress, [0.4, 0.5, 0.7], [0, 1, 0]),
            scaleX: useTransform(scrollYProgress, [0.4, 0.55], [0, 1]),
          }}
        />

        {/* Floating Energy Orbs */}
        <motion.div
          className="absolute h-2 w-2 rounded-full bg-[#16a245]"
          style={{
            left: '15%',
            top: useTransform(scrollYProgress, [0, 1], ['20%', '74%']),
            opacity: useTransform(
              scrollYProgress,
              [0, 0.1, 0.9, 1],
              [0, 0.8, 0.8, 0]
            ),
          }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="absolute h-2 w-2 rounded-full bg-[#16a245]"
          style={{
            left: '25%',
            top: useTransform(scrollYProgress, [0, 1], ['28%', '66%']),
            opacity: useTransform(
              scrollYProgress,
              [0, 0.1, 0.9, 1],
              [0, 0.8, 0.8, 0]
            ),
          }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: 0.4,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute h-2 w-2 rounded-full bg-[#16a245]"
          style={{
            left: '35%',
            top: useTransform(scrollYProgress, [0, 1], ['36%', '58%']),
            opacity: useTransform(
              scrollYProgress,
              [0, 0.1, 0.9, 1],
              [0, 0.8, 0.8, 0]
            ),
          }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: 0.8,
            ease: 'easeInOut',
          }}
        />

        {/* Cross-Section Energy Bridges */}
        <motion.div
          className="absolute h-px bg-gradient-to-r from-transparent via-[#16a245]/40 to-transparent"
          style={{
            left: '10%',
            right: '10%',
            top: '30%',
            opacity: useTransform(scrollYProgress, [0, 0.2, 0.4], [0, 0.8, 0]),
            scaleX: useTransform(scrollYProgress, [0, 0.3], [0.5, 1]),
          }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="absolute h-px bg-gradient-to-r from-transparent via-[#16a245]/40 to-transparent"
          style={{
            left: '10%',
            right: '10%',
            top: '55%',
            opacity: useTransform(
              scrollYProgress,
              [0.3, 0.5, 0.7],
              [0, 0.8, 0]
            ),
            scaleX: useTransform(scrollYProgress, [0.3, 0.6], [0.5, 1]),
          }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: 1.5,
            ease: 'easeInOut',
          }}
        />

        {/* Pulse Effect at Current Scroll Position */}
        <motion.div
          className="absolute left-4 h-4 w-4 rounded-full border-2 border-[#16a245]"
          style={{
            top: useTransform(scrollYProgress, [0, 1], ['10%', '90%']),
            opacity: useTransform(
              scrollYProgress,
              [0, 0.05, 0.95, 1],
              [0, 1, 1, 0]
            ),
          }}
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="absolute inset-1 rounded-full bg-[#16a245]/50" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ScrollAnimationSystem;
