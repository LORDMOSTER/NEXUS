import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import './RotatingText.css';

export default function RotatingText({
  texts = [],
  rotationInterval = 3000,
  staggerFrom = 'first',
  staggerDuration = 0.03,
  initial = { y: '100%', opacity: 0 },
  animate = { y: 0, opacity: 1 },
  exit = { y: '-120%', opacity: 0 },
  transition = { type: 'spring', damping: 25, stiffness: 300 },
  mainClassName = '',
  charClassName = '',
}) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!texts.length) return;
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, rotationInterval);
    return () => clearInterval(timerRef.current);
  }, [texts.length, rotationInterval]);

  if (!texts.length) return null;

  const currentText = texts[index];
  const chars = currentText.split('');

  const getDelay = (i) => {
    if (staggerFrom === 'last') return (chars.length - 1 - i) * staggerDuration;
    if (staggerFrom === 'center') {
      const center = Math.floor(chars.length / 2);
      return Math.abs(i - center) * staggerDuration;
    }
    return i * staggerDuration; // 'first' (default)
  };

  return (
    <span className={`rotating-text-wrapper ${mainClassName}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={index}
          className="rotating-text-inner"
          aria-live="polite"
        >
          {chars.map((char, i) => (
            <motion.span
              key={`${index}-${i}`}
              className={`rotating-text-char ${charClassName}`}
              initial={initial}
              animate={{
                ...animate,
                transition: {
                  ...transition,
                  delay: getDelay(i),
                },
              }}
              exit={{
                ...exit,
                transition: {
                  ...transition,
                  delay: getDelay(i),
                },
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
