import { useEffect, useRef, RefObject } from 'react';

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useScrollAnimation<T extends HTMLElement>(
  options: ScrollAnimationOptions = {}
): RefObject<T | null> {
  const { threshold = 0.15, rootMargin = '0px 0px -60px 0px', once = true } = options;
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('scroll-visible');
          if (once) observer.unobserve(el);
        } else if (!once) {
          el.classList.remove('scroll-visible');
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
}

// Counter animation hook
export function useCounter(
  end: number,
  duration = 2000,
  startOnVisible = true
): { ref: RefObject<HTMLElement | null>; value: number } {
  const ref = useRef<HTMLElement | null>(null);
  const valueRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const animate = () => {
      const startTime = performance.now();
      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * end);
        valueRef.current = current;
        if (el) el.textContent = current + (el.dataset.suffix || '');
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (!startOnVisible) {
      animate();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, startOnVisible]);

  return { ref, value: valueRef.current };
}