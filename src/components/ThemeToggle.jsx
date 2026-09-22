import { useCallback, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import useAuthStore from '../store/useAuthStore';

export default function ThemeToggle({ className = '', size = 48 }) {
  const { theme, toggleTheme } = useAuthStore();
  const isDark = theme === 'dark';

  const btnRef      = useRef(null);
  const isAnimating = useRef(false);

  /* ── Override browser's default view-transition cross-fade ── */
  useEffect(() => {
    const styleId = 'theme-toggle-vt-override';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      ::view-transition-old(root),
      ::view-transition-new(root) {
        animation: none;
        mix-blend-mode: normal;
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  /* ── Toggle handler — pure circle-spread only ── */
  const handleToggle = useCallback(async () => {
    if (isAnimating.current || !btnRef.current) return;
    isAnimating.current = true;

    const { top, left, width, height } = btnRef.current.getBoundingClientRect();
    const cx   = left + width  / 2;
    const cy   = top  + height / 2;
    const maxR = Math.hypot(
      Math.max(cx, window.innerWidth  - cx),
      Math.max(cy, window.innerHeight - cy)
    );

    /* Fallback — no View Transition support */
    if (!document.startViewTransition) {
      toggleTheme();
      isAnimating.current = false;
      return;
    }

    const transition = document.startViewTransition(() => {
      flushSync(toggleTheme);
    });

    await transition.ready;

    /* New theme layer: circle grows from button center */
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${cx}px ${cy}px)`,
          `circle(${maxR}px at ${cx}px ${cy}px)`,
        ],
      },
      {
        duration: 600,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        pseudoElement: '::view-transition-new(root)',
        fill: 'forwards',
      }
    );

    /* Old theme layer: fades out cleanly */
    document.documentElement.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      {
        duration: 550,
        easing: 'ease-in',
        pseudoElement: '::view-transition-old(root)',
        fill: 'forwards',
      }
    );

    await transition.finished;
    isAnimating.current = false;
  }, [toggleTheme]);

  /* ── Button geometry ── */
  const half  = size / 2;
  const ringR = half - 4;
  const circ  = 2 * Math.PI * ringR;

  return (
    <>
      <button
        ref={btnRef}
        id="theme-toggle-btn"
        onClick={handleToggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`theme-toggle-btn ${isDark ? 'theme-toggle-dark' : 'theme-toggle-light'} ${className}`}
        style={{ '--size': `${size}px` }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ overflow: 'visible', display: 'block' }}
          aria-hidden="true"
        >
          <defs>
            <filter id="tt-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="tt-icon-grad" cx="50%" cy="40%" r="60%">
              <stop offset="0%"   stopColor={isDark ? '#F9FAFB' : '#7C3AED'} />
              <stop offset="100%" stopColor={isDark ? '#C4B5FD' : '#5B21B6'} />
            </radialGradient>
            <linearGradient id="tt-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor={isDark ? '#A855F7' : '#7C3AED'} stopOpacity="0.9" />
              <stop offset="50%"  stopColor={isDark ? '#7C3AED' : '#A855F7'} stopOpacity="0.5" />
              <stop offset="100%" stopColor={isDark ? '#A855F7' : '#7C3AED'} stopOpacity="0"   />
            </linearGradient>
          </defs>

          {/* Spinning orbital arc */}
          <circle
            className="tt-orbit"
            cx={half} cy={half} r={ringR}
            fill="none"
            stroke="url(#tt-ring-grad)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={`${circ * 0.55} ${circ * 0.45}`}
            filter="url(#tt-glow)"
          />

          {/* Counter-orbit */}
          <circle
            className="tt-orbit-rev"
            cx={half} cy={half} r={ringR - 4}
            fill="none"
            stroke="url(#tt-ring-grad)"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeDasharray={`${circ * 0.25} ${circ * 0.75}`}
            opacity="0.5"
          />

          {/* Icon */}
          {isDark ? (
            <g className="tt-icon tt-icon-moon" filter="url(#tt-glow)">
              <path
                d={`M ${half - 2} ${half - 6} a 7 7 0 1 0 8 8 a 5 5 0 1 1 -8 -8 z`}
                fill="url(#tt-icon-grad)"
              />
            </g>
          ) : (
            <g className="tt-icon tt-icon-sun" filter="url(#tt-glow)">
              <circle cx={half} cy={half} r="6" fill="url(#tt-icon-grad)" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                return (
                  <line
                    key={deg}
                    x1={half + Math.cos(rad) * 9}  y1={half + Math.sin(rad) * 9}
                    x2={half + Math.cos(rad) * 12} y2={half + Math.sin(rad) * 12}
                    stroke="#7C3AED"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                );
              })}
            </g>
          )}
        </svg>
      </button>

      <style>{`
        .theme-toggle-btn {
          position: relative;
          width: var(--size, 48px);
          height: var(--size, 48px);
          border-radius: 50%;
          border: none;
          cursor: pointer;
          outline: none;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
          transition:
            box-shadow 0.35s cubic-bezier(0.22,1,0.36,1),
            transform  0.25s cubic-bezier(0.22,1,0.36,1);
          -webkit-tap-highlight-color: transparent;
        }

        .theme-toggle-light {
          background: #E2E8F0;
          box-shadow:
            5px 5px 14px #b8c2d1,
            -5px -5px 14px #ffffff,
            inset 0 0 0 1px rgba(255,255,255,0.7),
            0 0 16px rgba(124,58,237,0.08);
        }
        .theme-toggle-dark {
          background: radial-gradient(circle at 30% 30%, #1a0a2e, #090a0f);
          box-shadow:
            5px 5px 14px rgba(0,0,0,0.85),
            -5px -5px 14px rgba(255,255,255,0.04),
            inset 0 0 0 1px rgba(168,85,247,0.2),
            0 0 24px rgba(168,85,247,0.2);
        }

        .theme-toggle-btn:hover {
          transform: translateY(-3px) scale(1.08);
        }
        .theme-toggle-light:hover {
          box-shadow:
            7px 7px 18px #b8c2d1,
            -7px -7px 18px #ffffff,
            inset 0 0 0 1px rgba(255,255,255,0.8),
            0 0 22px rgba(124,58,237,0.18);
        }
        .theme-toggle-dark:hover {
          box-shadow:
            7px 7px 18px rgba(0,0,0,0.9),
            -7px -7px 18px rgba(255,255,255,0.05),
            inset 0 0 0 1px rgba(168,85,247,0.4),
            0 0 36px rgba(168,85,247,0.4);
        }

        .theme-toggle-btn:active {
          transform: translateY(0) scale(0.92);
        }

        /* Icon morph animations */
        .tt-icon {
          transform-origin: ${half}px ${half}px;
        }
        .tt-icon-sun {
          animation: tt-sun-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes tt-sun-in {
          from { opacity: 0; transform: scale(0.4) rotate(-90deg); }
          to   { opacity: 1; transform: scale(1)   rotate(0deg);   }
        }
        .tt-icon-moon {
          animation: tt-moon-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes tt-moon-in {
          from { opacity: 0; transform: scale(0.4) rotate(40deg); }
          to   { opacity: 1; transform: scale(1)   rotate(0deg);  }
        }

        /* Orbital rings */
        .tt-orbit {
          transform-origin: ${half}px ${half}px;
          animation: tt-spin 6s linear infinite;
        }
        .tt-orbit-rev {
          transform-origin: ${half}px ${half}px;
          animation: tt-spin-rev 4s linear infinite;
        }
        @keyframes tt-spin     { to { transform: rotate(360deg);  } }
        @keyframes tt-spin-rev { to { transform: rotate(-360deg); } }
      `}</style>
    </>
  );
}
