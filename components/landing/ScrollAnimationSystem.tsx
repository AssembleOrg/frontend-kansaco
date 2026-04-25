'use client';

import { motion } from 'framer-motion';

const orbs = [
  { left: '15%', top: '35%', delay: 0 },
  { left: '25%', top: '55%', delay: 0.4 },
  { left: '35%', top: '70%', delay: 0.8 },
];

const ScrollAnimationSystem = () => (
  <div className="pointer-events-none fixed inset-0 z-30">
    {orbs.map((orb, i) => (
      <motion.div
        key={i}
        className="absolute h-2 w-2 rounded-full bg-[#16a245]"
        style={{ left: orb.left, top: orb.top }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.6, 1, 0.6],
          boxShadow: [
            '0 0 5px #16a245',
            '0 0 15px #16a245, 0 0 25px #16a245',
            '0 0 5px #16a245',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, delay: orb.delay, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

export default ScrollAnimationSystem;
