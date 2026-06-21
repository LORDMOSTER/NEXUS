import { useEffect, useRef, useState } from 'react';
import './TextType.css';

export default function TextType({
  text = '',
  typingSpeed = 60,
  showCursor = true,
  cursorChar = '|',
  className = '',
  style = {},
  onComplete,
}) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    // Reset when text changes
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;

    if (!text) return;

    const interval = setInterval(() => {
      const next = indexRef.current + 1;
      setDisplayed(text.slice(0, next));
      indexRef.current = next;

      if (next >= text.length) {
        clearInterval(interval);
        setDone(true);
        onComplete?.();
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [text, typingSpeed]);

  return (
    <span className={`texttype-root ${className}`} style={style} aria-label={text}>
      {displayed}
      {showCursor && (
        <span
          className={`texttype-cursor ${done ? 'texttype-cursor--blink' : ''}`}
          aria-hidden="true"
        >
          {cursorChar}
        </span>
      )}
    </span>
  );
}
