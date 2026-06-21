import { useRef, useEffect, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import './MagicBento.css';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '0,229,255'; // Cyan accent matching --accent-color
const MOBILE_BREAKPOINT = 768;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const createParticleElement = (x, y, color = DEFAULT_GLOW_COLOR) => {
  const el = document.createElement('div');
  el.className = 'magic-particle';
  el.style.cssText = [
    'position:absolute',
    'width:4px',
    'height:4px',
    'border-radius:50%',
    `background:rgba(${color},1)`,
    `box-shadow:0 0 6px rgba(${color},0.6)`,
    'pointer-events:none',
    'z-index:100',
    `left:${x}px`,
    `top:${y}px`,
  ].join(';');
  return el;
};

const calculateSpotlightValues = (radius) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75,
});

const updateCardGlowProperties = (card, mouseX, mouseY, glowIntensity, radius) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;
  card.style.setProperty('--glow-x', `${relativeX}%`);
  card.style.setProperty('--glow-y', `${relativeY}%`);
  card.style.setProperty('--glow-intensity', glowIntensity.toString());
  card.style.setProperty('--glow-radius', `${radius}px`);
};

// ─── MOBILE DETECTION HOOK ───────────────────────────────────────────────────
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= MOBILE_BREAKPOINT
  );
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};

// ─── PARTICLE CARD ────────────────────────────────────────────────────────────
const ParticleCard = ({
  children,
  className = '',
  style,
  disableAnimations = false,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = true,
  enableMagnetism = false,
}) => {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timeoutsRef = useRef([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimRef = useRef(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;
    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(
        Math.random() * width,
        Math.random() * height,
        glowColor
      )
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimRef.current?.kill();
    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => particle.parentNode?.removeChild(particle),
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;
    if (!particlesInitialized.current) initializeParticles();

    memoizedParticles.current.forEach((particle, index) => {
      const id = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;
        const clone = particle.cloneNode(true);
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true,
        });
        gsap.to(clone, { opacity: 0.3, duration: 1.5, ease: 'power2.inOut', repeat: -1, yoyo: true });
      }, index * 100);
      timeoutsRef.current.push(id);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;
    const el = cardRef.current;

    const onEnter = () => {
      isHoveredRef.current = true;
      animateParticles();
    };

    const onLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();
      if (enableTilt) gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.5, ease: 'power3.out' });
      if (enableMagnetism) gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'power3.out' });
    };

    const onMove = (e) => {
      if (!enableTilt && !enableMagnetism) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - cy) / cy) * -10;
        const rotateY = ((x - cx) / cx) * 10;
        gsap.to(el, { rotateX, rotateY, duration: 0.1, ease: 'power2.out', transformPerspective: 1000 });
      }
      if (enableMagnetism) {
        const mx = (x - cx) * 0.05;
        const my = (y - cy) * 0.05;
        magnetismAnimRef.current = gsap.to(el, { x: mx, y: my, duration: 0.3, ease: 'power2.out' });
      }
    };

    const onClick = (e) => {
      if (!clickEffect) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const maxD = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );
      const ripple = document.createElement('div');
      ripple.style.cssText = [
        'position:absolute',
        `width:${maxD * 2}px`,
        `height:${maxD * 2}px`,
        'border-radius:50%',
        `background:radial-gradient(circle,rgba(${glowColor},0.4) 0%,rgba(${glowColor},0.2) 30%,transparent 70%)`,
        `left:${x - maxD}px`,
        `top:${y - maxD}px`,
        'pointer-events:none',
        'z-index:1000',
      ].join(';');
      el.appendChild(ripple);
      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ripple.remove() }
      );
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('click', onClick);

    return () => {
      isHoveredRef.current = false;
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('click', onClick);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor]);

  return (
    <div
      ref={cardRef}
      className={`particle-container ${className}`}
      style={{ ...style, position: 'relative', overflow: 'hidden' }}
    >
      {children}
    </div>
  );
};

// ─── GLOBAL SPOTLIGHT ────────────────────────────────────────────────────────
const GlobalSpotlight = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
}) => {
  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;

    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    spotlight.style.cssText = [
      'position:fixed',
      'width:800px',
      'height:800px',
      'border-radius:50%',
      'pointer-events:none',
      `background:radial-gradient(circle,rgba(${glowColor},0.15) 0%,rgba(${glowColor},0.08) 15%,rgba(${glowColor},0.04) 25%,rgba(${glowColor},0.02) 40%,rgba(${glowColor},0.01) 65%,transparent 70%)`,
      'z-index:200',
      'opacity:0',
      'transform:translate(-50%,-50%)',
      'mix-blend-mode:screen',
    ].join(';');
    document.body.appendChild(spotlight);

    const onMove = (e) => {
      if (!gridRef.current) return;
      const section = gridRef.current.closest('.bento-section') || gridRef.current;
      const rect = section.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      const cards = gridRef.current.querySelectorAll('.magic-bento-card');
      if (!inside) {
        gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: 'power2.out' });
        cards.forEach((c) => c.style.setProperty('--glow-intensity', '0'));
        return;
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDist = Infinity;

      cards.forEach((card) => {
        const cr = card.getBoundingClientRect();
        const cx = cr.left + cr.width / 2;
        const cy = cr.top + cr.height / 2;
        const rawDist = Math.hypot(e.clientX - cx, e.clientY - cy) - Math.max(cr.width, cr.height) / 2;
        const dist = Math.max(0, rawDist);
        minDist = Math.min(minDist, dist);

        let intensity = 0;
        if (dist <= proximity) intensity = 1;
        else if (dist <= fadeDistance) intensity = (fadeDistance - dist) / (fadeDistance - proximity);

        updateCardGlowProperties(card, e.clientX, e.clientY, intensity, spotlightRadius);
      });

      gsap.to(spotlight, { left: e.clientX, top: e.clientY, duration: 0.1, ease: 'power2.out' });
      const targetOpacity =
        minDist <= proximity ? 0.8
        : minDist <= fadeDistance ? ((fadeDistance - minDist) / (fadeDistance - proximity)) * 0.8
        : 0;
      gsap.to(spotlight, { opacity: targetOpacity, duration: targetOpacity > 0 ? 0.2 : 0.5, ease: 'power2.out' });
    };

    const onLeave = () => {
      gridRef.current?.querySelectorAll('.magic-bento-card').forEach((c) =>
        c.style.setProperty('--glow-intensity', '0')
      );
      gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: 'power2.out' });
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      spotlight.parentNode?.removeChild(spotlight);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

// ─── GRID WRAPPER ────────────────────────────────────────────────────────────
const BentoCardGrid = ({ children, gridRef }) => (
  <div className="magic-card-grid bento-section" ref={gridRef}>
    {children}
  </div>
);

// ─── MAGIC BENTO — SINGLE CARD USAGE ─────────────────────────────────────────
/**
 * MagicBento — wraps a single exam card with full GSAP animation stack.
 *
 * Props:
 *  children        – the card content JSX
 *  className       – extra CSS classes to apply
 *  style           – inline styles
 *  glowColor       – RGB string e.g. "0,229,255"
 *  enableTilt      – 3D tilt on hover
 *  enableMagnetism – subtle magnetic pull toward cursor
 *  clickEffect     – radial ripple on click
 *  enableBorderGlow– border gradient glow following cursor
 *  disableAnimations – hard off switch
 *  particleCount   – number of floating particles on hover
 */
export const MagicBentoCard = ({
  children,
  className = '',
  style,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  enableMagnetism = false,
  clickEffect = true,
  enableBorderGlow = true,
  disableAnimations = false,
  particleCount = DEFAULT_PARTICLE_COUNT,
}) => {
  const isMobile = useMobileDetection();
  const skip = disableAnimations || isMobile;

  const cardClass = [
    'magic-bento-card',
    enableBorderGlow ? 'magic-bento-card--border-glow' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <ParticleCard
      className={cardClass}
      style={{ '--glow-color': glowColor, ...style }}
      disableAnimations={skip}
      particleCount={particleCount}
      glowColor={glowColor}
      enableTilt={enableTilt}
      clickEffect={clickEffect}
      enableMagnetism={enableMagnetism}
    >
      {children}
    </ParticleCard>
  );
};

// ─── MAGIC BENTO GRID — WRAPS MULTIPLE CARDS WITH SPOTLIGHT ──────────────────
export const MagicBentoGrid = ({
  children,
  glowColor = DEFAULT_GLOW_COLOR,
  enableSpotlight = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  disableAnimations = false,
}) => {
  const gridRef = useRef(null);
  const isMobile = useMobileDetection();
  const skip = disableAnimations || isMobile;

  return (
    <>
      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={skip}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}
      <BentoCardGrid gridRef={gridRef}>{children}</BentoCardGrid>
    </>
  );
};

// ─── DEFAULT EXPORT (single-card standalone, matching original docs API) ──────
const MagicBento = ({
  title,
  description,
  label,
  color = '#0D1117',
  glowColor = DEFAULT_GLOW_COLOR,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  clickEffect = true,
  enableMagnetism = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
}) => {
  const gridRef = useRef(null);
  const isMobile = useMobileDetection();
  const skip = disableAnimations || isMobile;

  const cardClass = [
    'magic-bento-card',
    enableBorderGlow ? 'magic-bento-card--border-glow' : '',
  ].join(' ');

  return (
    <>
      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={skip}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}
      <BentoCardGrid gridRef={gridRef}>
        <ParticleCard
          className={cardClass}
          style={{ backgroundColor: color, '--glow-color': glowColor }}
          disableAnimations={skip}
          particleCount={particleCount}
          glowColor={glowColor}
          enableTilt={enableTilt}
          clickEffect={clickEffect}
          enableMagnetism={enableMagnetism}
        >
          <div className="magic-bento-card_header">
            <div className="magic-bento-card_label">{label}</div>
          </div>
          <div className="magic-bento-card_content">
            <h2 className="magic-bento-card_title">{title}</h2>
            <p className="magic-bento-card_description">{description}</p>
          </div>
        </ParticleCard>
      </BentoCardGrid>
    </>
  );
};

export default MagicBento;
